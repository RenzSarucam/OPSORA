<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_projects(): void
    {
        Project::factory()->count(3)->create();

        $this->actingAs(User::factory()->create())
            ->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_a_project(): void
    {
        $response = $this->actingAs(User::factory()->create())
            ->postJson('/api/projects', [
                'name' => 'ReOrderPro',
                'description' => 'Inventory system',
                'environment' => 'Production',
                'url' => 'https://reorderpro.example.com',
                'health_check_url' => 'https://reorderpro.example.com/api/health',
                'container_name' => 'reorderpro-app',
            ]);

        $response->assertOk()->assertJsonPath('data.name', 'ReOrderPro');

        $this->assertDatabaseHas('projects', ['name' => 'ReOrderPro']);
        $this->assertDatabaseHas('activity_logs', ['action' => 'project_created']);
    }

    public function test_creating_a_project_requires_valid_fields(): void
    {
        $response = $this->actingAs(User::factory()->create())
            ->postJson('/api/projects', [
                'name' => '',
                'environment' => 'NotARealEnvironment',
                'url' => 'not-a-url',
                'health_check_url' => 'also-not-a-url',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'environment', 'url', 'health_check_url']);
    }

    public function test_can_update_a_project(): void
    {
        $project = Project::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs(User::factory()->create())
            ->putJson("/api/projects/{$project->id}", [
                'name' => 'New Name',
                'environment' => $project->environment,
                'url' => $project->url,
                'health_check_url' => $project->health_check_url,
            ]);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertDatabaseHas('activity_logs', ['action' => 'project_updated']);
    }

    public function test_toggling_is_active_logs_enable_disable_not_generic_update(): void
    {
        $project = Project::factory()->create(['is_active' => true]);

        $this->actingAs(User::factory()->create())
            ->putJson("/api/projects/{$project->id}", [
                'name' => $project->name,
                'environment' => $project->environment,
                'url' => $project->url,
                'health_check_url' => $project->health_check_url,
                'is_active' => false,
            ])
            ->assertOk();

        $this->assertDatabaseHas('activity_logs', ['action' => 'project_disabled']);
        $this->assertDatabaseMissing('activity_logs', ['action' => 'project_updated']);
    }

    public function test_can_delete_a_project(): void
    {
        $project = Project::factory()->create();

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/projects/{$project->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'project_deleted']);
    }

    public function test_deleting_a_project_does_not_orphan_its_activity_log(): void
    {
        $project = Project::factory()->create();
        ActivityLog::create([
            'project_id' => $project->id,
            'action' => 'project_created',
            'description' => 'Added '.$project->name,
        ]);

        $project->delete();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'project_created',
            'project_id' => null,
        ]);
    }
}