<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMustahiqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'ashnaf' => ['required', Rule::in(['fakir', 'miskin', 'amil', 'mualaf', 'riqab', 'gharim', 'fisabilillah', 'ibnusabil'])],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ];
    }
}
