<?php

namespace App\Services;

use App\Models\HealthCheck;
use App\Models\Project;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class HealthCheckService
{
    private const TIMEOUT_SECONDS = 10;

    private const WARNING_RESPONSE_TIME_MS = 1000;

    public function __construct(private AlertService $alertService) {}

    public function check(Project $project): HealthCheck
    {
        $start = microtime(true);

        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)->get($project->health_check_url);

            $responseTime = $this->elapsedMs($start);
            $httpStatus = $response->status();
            $status = $this->determineStatus($httpStatus, $responseTime);
            $errorMessage = null;
        } catch (ConnectionException $e) {
            $responseTime = null;
            $httpStatus = null;
            $status = 'offline';
            $errorMessage = $e->getMessage();
        }

        $healthCheck = $project->healthChecks()->create([
            'status' => $status,
            'http_status' => $httpStatus,
            'response_time' => $responseTime,
            'error_message' => $errorMessage,
            'checked_at' => now(),
        ]);

        $this->alertService->handle($project, $healthCheck);

        return $healthCheck;
    }

    private function determineStatus(int $httpStatus, int $responseTimeMs): string
    {
        if ($httpStatus >= 500) {
            return 'offline';
        }

        if ($httpStatus < 200 || $httpStatus >= 300 || $responseTimeMs > self::WARNING_RESPONSE_TIME_MS) {
            return 'warning';
        }

        return 'online';
    }

    private function elapsedMs(float $start): int
    {
        return (int) round((microtime(true) - $start) * 1000);
    }
}