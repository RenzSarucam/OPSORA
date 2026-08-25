<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public function log(string $action, string $description, ?Project $project = null): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'project_id' => $project?->id,
            'action' => $action,
            'description' => $description,
        ]);
    }
}