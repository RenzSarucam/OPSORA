<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityAndDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_log_lists_newest_first(): void
    {
        $project = Project::factory()->create();

        ActivityLog::create(['project_id' => $project->id, 'action' => 'project_created', 'description' => 'first']);
        ActivityLog::create(['project_id' => $project->id, 'action' => 'project_updated', 'description' => 'second']);

        $response = $this->actingAs(User::factory()->create())
            ->getJson('/api/activity');

        $response->assertOk();
        $this->assertSame('second', $response->json('data.0.description'));
        $this->assertSame('first', $response->json('data.1.description'));
    }

    public function test_dashboard_stats_reflect_project_statuses(): void
    {
        $online = Project::factory()->create();
        $online->healthChecks()->create(['status' => 'online', 'response_time' => 40, 'checked_at' => now()]);

        $warning = Project::factory()->create();
        $warning->healthChecks()->create(['status' => 'warning', 'response_time' => 1200, 'checked_at' => now()]);

        $offline = Project::factory()->create();
        $offline->healthChecks()->create(['status' => 'offline', 'checked_at' => now()]);

        $offline->alerts()->create([
            'type' => 'offline', 'severity' => 'critical', 'message' => 'down', 'status' => 'active',
        ]);

        $pending = Project::factory()->create();

        $response = $this->actingAs(User::factory()->create())->getJson('/api/dashboard');

        $response->assertOk();
        $response->assertJsonPath('stats.total_projects', 4);
        $response->assertJsonPath('stats.online', 1);
        $response->assertJsonPath('stats.warning', 1);
        $response->assertJsonPath('stats.offline', 1);
        $response->assertJsonPath('stats.active_alerts', 1);
        // Average of the two recorded response times (40, 1200) — the
        // pending project has none yet and must not skew the average.
        $response->assertJsonPath('stats.average_response_time', 620);
    }

    public function test_dashboard_average_response_time_is_null_with_no_data(): void
    {
        Project::factory()->create();

        $this->actingAs(User::factory()->create())
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.average_response_time', null);
    }
}