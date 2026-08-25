<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ActivityLogService;

class ProjectController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function index()
    {
        $projects = Project::with(['latestHealthCheck', 'server'])->orderBy('name')->get();

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create($request->validated())->fresh();

        $this->activityLogService->log('project_created', "Added {$project->name}.", $project);

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        $project->load(['latestHealthCheck', 'server']);

        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        $project->load(['latestHealthCheck', 'server']);

        $changedKeys = array_diff(array_keys($project->getChanges()), ['updated_at']);

        if ($changedKeys === ['is_active']) {
            $this->activityLogService->log(
                $project->is_active ? 'project_enabled' : 'project_disabled',
                ($project->is_active ? 'Enabled' : 'Disabled')." {$project->name}.",
                $project
            );
        } elseif (! empty($changedKeys)) {
            $this->activityLogService->log('project_updated', "Updated {$project->name}.", $project);
        }

        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $this->activityLogService->log('project_deleted', "Deleted {$project->name}.");
        $project->delete();

        return response()->noContent();
    }
}