<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;

class ActivityController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with(['user:id,name', 'project:id,name'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return ActivityLogResource::collection($logs);
    }
}