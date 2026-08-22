<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Services\HealthCheckService;
use Illuminate\Console\Command;
use Throwable;

class OpsoraHealthCheckCommand extends Command
{
    protected $signature = 'opsora:health-check';

    protected $description = 'Run HTTP health checks against all active projects and record the results';

    public function handle(HealthCheckService $healthCheckService): int
    {
        $projects = Project::where('is_active', true)->get();

        foreach ($projects as $project) {
            try {
                $healthCheck = $healthCheckService->check($project);

                $this->info("{$project->name}: {$healthCheck->status}");
            } catch (Throwable $e) {
                $this->error("{$project->name}: failed to check ({$e->getMessage()})");
            }
        }

        return self::SUCCESS;
    }
}