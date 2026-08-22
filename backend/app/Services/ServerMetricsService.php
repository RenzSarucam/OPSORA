<?php

namespace App\Services;

use App\Models\Server;

class ServerMetricsService
{
    /**
     * Return the server's current CPU/memory/disk usage.
     *
     * No metrics-collection agent is wired up for the MVP — registering a
     * server here only records its name/host/environment, it does not grant
     * any access to it. This is the seam where a real agent or exporter
     * integration plugs in later; until then it always reports unavailable
     * rather than fabricating numbers.
     *
     * @return array{available: bool, cpu: int|null, memory: int|null, disk: int|null}
     */
    public function metrics(Server $server): array
    {
        return [
            'available' => false,
            'cpu' => null,
            'memory' => null,
            'disk' => null,
        ];
    }
}