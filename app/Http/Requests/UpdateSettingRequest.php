<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.masjid_name' => ['nullable', 'string', 'max:255'],
            'settings.masjid_address' => ['nullable', 'string'],
            'settings.contact_phone' => ['nullable', 'string', 'max:50'],
            'settings.zakat_fitrah_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
