<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Support\Facades\Date;

class HealthCheckController extends Controller
{
    public function show(Project $project)
    {
        $latest = $project->latestHealthCheck;
        $checks = $this->last24Hours($project);

        $total = $checks->count();
        $successful = $checks->where('status', '!=', 'offline')->count();
        $uptime = $total > 0 ? round($successful / $total * 100, 2) : null;

        $averageResponseTime = $checks->pluck('response_time')->filter()->avg();

        return response()->json([
            'status' => $latest?->status,
            'http_status' => $latest?->http_status,
            'response_time' => $latest?->response_time,
            'average_response_time' => $averageResponseTime !== null ? (int) round($averageResponseTime) : null,
            'uptime' => $uptime,
            'checked_at' => $latest?->checked_at,
        ]);
    }

    public function history(Project $project)
    {
        $checks = $this->last24Hours($project)
            ->sortBy('checked_at')
            ->values()
            ->map(fn ($check) => [
                'id' => $check->id,
                'status' => $check->status,
                'http_status' => $check->http_status,
                'response_time' => $check->response_time,
                'checked_at' => $check->checked_at,
            ]);

        return response()->json(['data' => $checks]);
    }

    private function last24Hours(Project $project)
    {
        return $project->healthChecks()
            ->where('checked_at', '>=', Date::now()->subHours(24))
            ->get();
    }
}