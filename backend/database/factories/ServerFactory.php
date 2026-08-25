<?php

namespace Database\Factories;

use App\Models\Server;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Server>
 */
class ServerFactory extends Factory
{
    protected $model = Server::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->domainWord().' server',
            'host' => fake()->ipv4(),
            'environment' => fake()->randomElement(Server::ENVIRONMENTS),
            'is_active' => true,
        ];
    }
}