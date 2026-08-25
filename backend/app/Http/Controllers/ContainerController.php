<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ActivityLogService;
use App\Services\DockerService;

class ContainerController extends Controller
{
    public function __construct(
        private DockerService $dockerService,
        private ActivityLogService $activityLogService
    ) {}

    public function index()
    {
        $containers = $this->dockerService->listContainers();

        if (empty($containers) && ! $this->dockerService->isAvailable()) {
            return response()->json([
                'available' => false,
                'data' => [],
            ]);
        }

        $projectsByContainer = Project::whereNotNull('container_name')->pluck('name', 'container_name');

        $data = collect($containers)->map(fn (array $container) => [
            ...$container,
            'project' => $projectsByContainer->get($container['name']),
        ])->values();

        return response()->json([
            'available' => true,
            'data' => $data,
        ]);
    }

    public function restart(string $id)
    {
        if (! preg_match('/^[a-zA-Z0-9_.-]+$/', $id)) {
            return response()->json(['message' => 'Invalid container identifier.'], 422);
        }

        if (! $this->dockerService->restart($id)) {
            return response()->json(['message' => 'Unable to restart container.'], 422);
        }

        $project = Project::where('container_name', $id)->first();
        $this->activityLogService->log('container_restarted', "Restarted container {$id}.", $project);

        return response()->json(['message' => 'Container restarted.']);
    }
}