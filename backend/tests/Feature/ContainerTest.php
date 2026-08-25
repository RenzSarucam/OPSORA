<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\DockerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ContainerTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_docker_unavailable_honestly_instead_of_faking_data(): void
    {
        $this->mock(DockerService::class, function ($mock) {
            $mock->shouldReceive('listContainers')->andReturn([]);
            $mock->shouldReceive('isAvailable')->andReturn(false);
        });

        $this->actingAs(User::factory()->create())
            ->getJson('/api/containers')
            ->assertOk()
            ->assertJson(['available' => false, 'data' => []]);
    }

    public function test_lists_containers_and_maps_them_to_their_project(): void
    {
        Project::factory()->create(['container_name' => 'reorderpro-app', 'name' => 'ReOrderPro']);

        $this->mock(DockerService::class, function ($mock) {
            $mock->shouldReceive('listContainers')->andReturn([
                ['id' => 'abc123', 'name' => 'reorderpro-app', 'image' => 'reorderpro:latest', 'status' => 'running', 'raw_status' => 'Up 2 hours'],
            ]);
        });

        $this->actingAs(User::factory()->create())
            ->getJson('/api/containers')
            ->assertOk()
            ->assertJsonPath('available', true)
            ->assertJsonPath('data.0.project', 'ReOrderPro');
    }

    public function test_can_restart_a_container_and_logs_activity(): void
    {
        Project::factory()->create(['container_name' => 'reorderpro-app']);

        $this->mock(DockerService::class, function ($mock) {
            $mock->shouldReceive('restart')->with('reorderpro-app')->andReturn(true);
        });

        $this->actingAs(User::factory()->create())
            ->postJson('/api/containers/reorderpro-app/restart')
            ->assertOk();

        $this->assertDatabaseHas('activity_logs', ['action' => 'container_restarted']);
    }

    public function test_rejects_a_container_id_with_shell_metacharacters(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/containers/'.rawurlencode('bad;rm').'/restart')
            ->assertStatus(422);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}