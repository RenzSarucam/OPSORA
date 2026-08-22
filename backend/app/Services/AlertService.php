<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\HealthCheck;
use App\Models\Project;

class AlertService
{
    public function handle(Project $project, HealthCheck $healthCheck): void
    {
        if ($healthCheck->status === 'online') {
            $this->resolveActiveAlert($project);

            return;
        }

        $this->createAlertIfNeeded($project, $healthCheck);
    }

    private function createAlertIfNeeded(Project $project, HealthCheck $healthCheck): void
    {
        $hasActiveAlert = Alert::where('project_id', $project->id)
            ->where('status', 'active')
            ->exists();

        if ($hasActiveAlert) {
            return;
        }

        Alert::create([
            'project_id' => $project->id,
            'type' => $healthCheck->status,
            'severity' => $this->severityFor($healthCheck->status),
            'message' => $this->messageFor($project, $healthCheck),
            'status' => 'active',
        ]);
    }

    private function resolveActiveAlert(Project $project): void
    {
        Alert::where('project_id', $project->id)
            ->where('status', 'active')
            ->update([
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);
    }

    private function severityFor(string $status): string
    {
        return $status === 'offline' ? 'critical' : 'warning';
    }

    private function messageFor(Project $project, HealthCheck $healthCheck): string
    {
        if ($healthCheck->status === 'offline') {
            $reason = $healthCheck->error_message ?? "HTTP {$healthCheck->http_status}";

            return "{$project->name} is offline ({$reason})";
        }

        return "{$project->name} response time is elevated ({$healthCheck->response_time}ms)";
    }
}