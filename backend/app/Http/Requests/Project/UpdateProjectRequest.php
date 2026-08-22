<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'environment' => ['required', Rule::in(Project::ENVIRONMENTS)],
            'url' => ['required', 'url', 'max:2048'],
            'health_check_url' => ['required', 'url', 'max:2048'],
            'server_id' => ['nullable', 'integer', 'exists:servers,id'],
            'container_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
