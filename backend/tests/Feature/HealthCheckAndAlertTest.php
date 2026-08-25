<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Project;
use App\Models\User;
use App\Services\HealthCheckService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HealthCheckAndAlertTest extends TestCase
{
    use RefreshDatabase;

    private function check(Project $project): void
    {
        app(HealthCheckService::class)->check($project->fresh());
    }

    public function test_200_response_under_threshold_is_online(): void
    {
        $project = Project::factory()->create();
        Http::fake([$project->health_check_url => Http::response('ok', 200)]);

        $this->check($project);

        $this->assertSame('online', $project->fresh()->latestHealthCheck->status);
        $this->assertDatabaseCount('alerts', 0);
    }

    public function test_500_response_is_offline_and_creates_a_critical_alert(): void
    {
        $project = Project::factory()->create();
        Http::fake([$project->health_check_url => Http::response('error', 500)]);

        $this->check($project);

        $this->assertSame('offline', $project->fresh()->latestHealthCheck->status);
        $this->assertDatabaseHas('alerts', [
            'project_id' => $project->id,
            'severity' => 'critical',
            'status' => 'active',
        ]);
    }

    public function test_300_response_is_warning(): void
    {
        $project = Project::factory()->create();
        Http::fake([$project->health_check_url => Http::response('', 302)]);

        $this->check($project);

        $this->assertSame('warning', $project->fresh()->latestHealthCheck->status);
        $this->assertDatabaseHas('alerts', ['project_id' => $project->id, 'severity' => 'warning']);
    }

    public function test_slow_response_over_1000ms_is_warning_even_with_200(): void
    {
        $project = Project::factory()->create();
        Http::fake(function (ClientRequest $request) {
            usleep(1_100_000);

            return Http::response('ok', 200);
        });

        $this->check($project);

        $this->assertSame('warning', $project->fresh()->latestHealthCheck->status);
    }

    public function test_connection_failure_is_offline(): void
    {
        $project = Project::factory()->create();
        Http::fake([$project->health_check_url => fn () => throw new \Illuminate\Http\Client\ConnectionException('Could not resolve host')]);

        $this->check($project);

        $healthCheck = $project->fresh()->latestHealthCheck;
        $this->assertSame('offline', $healthCheck->status);
        $this->assertNull($healthCheck->http_status);
        $this->assertNotNull($healthCheck->error_message);
    }

    public function test_alert_is_not_duplicated_while_project_stays_offline(): void
    {
        $project = Project::factory()->create();
        Http::fake([$project->health_check_url => Http::response('error', 500)]);

        $this->check($project);
        $this->check($project);
        $this->check($project);

        $this->assertDatabaseCount('health_checks', 3);
        $this->assertDatabaseCount('alerts', 1);
        $this->assertDatabaseHas('alerts', ['status' => 'active']);
    }

    public function test_alert_auto_resolves_when_project_recovers(): void
    {
        $project = Project::factory()->create();

        // Http::fake() called again mid-test does not override an earlier
        // stub for the same URL (first-registered match wins), so a
        // multi-step scenario needs a single ordered sequence instead.
        Http::fakeSequence()
            ->push('error', 500)
            ->push('ok', 200);

        $this->check($project);
        $this->assertDatabaseHas('alerts', ['status' => 'active']);

        $this->check($project);

        $this->assertDatabaseCount('alerts', 1);
        $alert = Alert::first();
        $this->assertSame('resolved', $alert->status);
        $this->assertNotNull($alert->resolved_at);
    }

    public function test_a_new_alert_can_be_created_after_recovery_and_a_second_outage(): void
    {
        $project = Project::factory()->create();

        Http::fakeSequence()
            ->push('error', 500)
            ->push('ok', 200)
            ->push('error', 500);

        $this->check($project);
        $this->check($project);
        $this->check($project);

        $this->assertDatabaseCount('alerts', 2);
        $this->assertDatabaseHas('alerts', ['status' => 'active']);
        $this->assertDatabaseHas('alerts', ['status' => 'resolved']);
    }

    public function test_uptime_reflects_only_the_last_24_hours(): void
    {
        $project = Project::factory()->create();

        $project->healthChecks()->create([
            'status' => 'offline', 'checked_at' => now()->subHours(30),
        ]);
        $project->healthChecks()->create([
            'status' => 'online', 'response_time' => 50, 'checked_at' => now()->subHours(1),
        ]);
        $project->healthChecks()->create([
            'status' => 'online', 'response_time' => 60, 'checked_at' => now()->subMinutes(10),
        ]);

        $response = $this->actingAs(User::factory()->create())
            ->getJson("/api/projects/{$project->id}/health");

        $response->assertOk()->assertJsonPath('uptime', 100);
    }

    public function test_uptime_is_null_with_no_health_check_data(): void
    {
        $project = Project::factory()->create();

        $this->actingAs(User::factory()->create())
            ->getJson("/api/projects/{$project->id}/health")
            ->assertOk()
            ->assertJsonPath('uptime', null);
    }

    public function test_manually_resolving_an_alert(): void
    {
        $project = Project::factory()->create();
        $alert = $project->alerts()->create([
            'type' => 'offline',
            'severity' => 'critical',
            'message' => "{$project->name} is offline",
            'status' => 'active',
        ]);

        $this->actingAs(User::factory()->create())
            ->postJson("/api/alerts/{$alert->id}/resolve")
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('alerts', ['id' => $alert->id, 'status' => 'resolved']);
        $this->assertDatabaseHas('activity_logs', ['action' => 'alert_resolved']);
    }
}