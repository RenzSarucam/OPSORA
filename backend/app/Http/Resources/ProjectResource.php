<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'environment' => $this->environment,
            'url' => $this->url,
            'health_check_url' => $this->health_check_url,
            'server_id' => $this->server_id,
            'container_name' => $this->container_name,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'latest_health' => $this->whenLoaded(
                'latestHealthCheck',
                fn () => $this->latestHealthCheck ? [
                    'status' => $this->latestHealthCheck->status,
                    'http_status' => $this->latestHealthCheck->http_status,
                    'response_time' => $this->latestHealthCheck->response_time,
                    'checked_at' => $this->latestHealthCheck->checked_at,
                ] : null
            ),
            'server' => $this->whenLoaded(
                'server',
                fn () => $this->server ? [
                    'id' => $this->server->id,
                    'name' => $this->server->name,
                ] : null
            ),
        ];
    }
}
