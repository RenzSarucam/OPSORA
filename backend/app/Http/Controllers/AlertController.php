<?php

namespace App\Http\Controllers;

use App\Http\Resources\AlertResource;
use App\Models\Alert;
use App\Services\ActivityLogService;

class AlertController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function index()
    {
        $alerts = Alert::with('project')
            ->orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->get();

        return AlertResource::collection($alerts);
    }

    public function resolve(Alert $alert)
    {
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        $alert->load('project');

        $this->activityLogService->log(
            'alert_resolved',
            "Manually resolved: {$alert->message}",
            $alert->project
        );

        return new AlertResource($alert);
    }
}