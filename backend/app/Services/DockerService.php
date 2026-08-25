<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;

class DockerService
{
    public function isAvailable(): bool
    {
        try {
            return Process::timeout(5)->run(['docker', 'version', '--format', 'json'])->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * @return array<int, array{id: string, name: string, image: string, status: string, raw_status: string|null}>
     */
    public function listContainers(): array
    {
        try {
            $result = Process::timeout(10)->run(['docker', 'ps', '-a', '--format', '{{json .}}']);
        } catch (\Throwable) {
            return [];
        }

        if (! $result->successful()) {
            return [];
        }

        $lines = array_filter(explode("\n", trim($result->output())));

        return collect($lines)
            ->map(fn (string $line) => json_decode($line, true))
            ->filter()
            ->map(fn (array $c) => [
                'id' => $c['ID'] ?? '',
                'name' => ltrim($c['Names'] ?? '', '/'),
                'image' => $c['Image'] ?? '',
                'status' => $this->normalizeStatus($c['State'] ?? $c['Status'] ?? ''),
                'raw_status' => $c['Status'] ?? null,
            ])
            ->values()
            ->all();
    }

    public function restart(string $id): bool
    {
        try {
            return Process::timeout(30)->run(['docker', 'restart', $id])->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    private function normalizeStatus(string $state): string
    {
        return str_contains(strtolower($state), 'up') || str_contains(strtolower($state), 'running')
            ? 'running'
            : 'stopped';
    }
}