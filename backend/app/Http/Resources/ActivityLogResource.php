<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description,
            'user' => $this->whenLoaded(
                'user',
                fn () => $this->user ? ['id' => $this->user->id, 'name' => $this->user->name] : null
            ),
            'project' => $this->whenLoaded(
                'project',
                fn () => $this->project ? ['id' => $this->project->id, 'name' => $this->project->name] : null
            ),
            'created_at' => $this->created_at,
        ];
    }
}