<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Server;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_and_list_servers(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/servers', [
            'name' => 'Production Server',
            'host' => '10.0.0.5',
            'environment' => 'Production',
        ])->assertOk();

        $this->actingAs($user)
            ->getJson('/api/servers')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Production Server');
    }

    public function test_deleting_a_server_nulls_out_linked_projects_instead_of_deleting_them(): void
    {
        $server = Server::factory()->create();
        $project = Project::factory()->create(['server_id' => $server->id]);

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/servers/{$server->id}")
            ->assertNoContent();

        $this->assertDatabaseHas('projects', ['id' => $project->id, 'server_id' => null]);
    }

    public function test_creating_a_server_requires_a_known_environment(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/servers', [
                'name' => 'Server',
                'host' => '10.0.0.5',
                'environment' => 'NotReal',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['environment']);
    }
}