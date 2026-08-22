<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = env('ADMIN_PASSWORD') ?: Str::random(16);

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => env('ADMIN_NAME', 'Admin'),
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        if (! env('ADMIN_PASSWORD')) {
            $this->command->warn("ADMIN_PASSWORD was not set — generated password: {$password}");
        }

        // Demo data — placeholder URLs, not expected to resolve.
        $demoProjects = [
            [
                'name' => 'ReOrderPro',
                'description' => 'Demo project — inventory reorder platform.',
                'environment' => 'Production',
                'url' => 'https://reorderpro.example.com',
                'health_check_url' => 'https://reorderpro.example.com/api/health',
                'container_name' => 'reorderpro-app',
            ],
            [
                'name' => 'E-JO',
                'description' => 'Demo project — internal job tracker.',
                'environment' => 'Production',
                'url' => 'https://ejo.example.com',
                'health_check_url' => 'https://ejo.example.com/api/health',
                'container_name' => 'ejo-app',
            ],
            [
                'name' => 'ICMS',
                'description' => 'Demo project — content management system.',
                'environment' => 'Production',
                'url' => 'https://icms.example.com',
                'health_check_url' => 'https://icms.example.com/api/health',
                'container_name' => 'icms-app',
            ],
            [
                'name' => 'Portfolio',
                'description' => 'Demo project — public portfolio site.',
                'environment' => 'Staging',
                'url' => 'https://portfolio.example.com',
                'health_check_url' => 'https://portfolio.example.com/api/health',
                'container_name' => 'portfolio-app',
            ],
        ];

        foreach ($demoProjects as $demoProject) {
            Project::updateOrCreate(
                ['name' => $demoProject['name']],
                $demoProject
            );
        }
    }
}