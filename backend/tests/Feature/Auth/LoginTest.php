<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'correct-password',
        ]);

        $response->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(422);
        }

        // The 6th attempt is locked out even with the correct password.
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'correct-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('errors.email.0', fn (string $message) => str_contains($message, 'Too many login attempts'));
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_authenticated_user_can_log_out(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/logout')
            ->assertNoContent();

        // Not assertGuest()/a bare guard(null) check: Sanctum's guard memoizes
        // the user it resolved to authorize /api/logout itself, and that
        // cached instance outlives the request within a single test process.
        // The 'web' session guard AuthController::logout() actually calls is
        // the source of truth here.
        $this->assertFalse($this->app['auth']->guard('web')->check());
    }

    public function test_current_user_endpoint_returns_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', $user->email);
    }

    public function test_protected_routes_reject_unauthenticated_requests(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/projects')->assertUnauthorized();
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }
}