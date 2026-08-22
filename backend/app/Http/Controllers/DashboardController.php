<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;

class DashboardController extends Controller
{
    public function index()
    {
        $projects = Project::with('latestHealthCheck')->orderBy('name')->get();

        $statuses = $projects->map(fn (Project $project) => $project->latestHealthCheck?->status);
        $responseTimes = $projects->pluck('latestHealthCheck.response_time')->filter();

        return response()->json([
            'stats' => [
                'total_projects' => $projects->count(),
                'online' => $statuses->filter(fn ($status) => $status === 'online')->count(),
                'warning' => $statuses->filter(fn ($status) => $status === 'warning')->count(),
                'offline' => $statuses->filter(fn ($status) => $status === 'offline')->count(),
                'active_alerts' => 0,
                'average_response_time' => $responseTimes->isNotEmpty()
                    ? (int) round($responseTimes->avg())
                    : null,
            ],
            'projects' => ProjectResource::collection($projects),
        ]);
    }
}