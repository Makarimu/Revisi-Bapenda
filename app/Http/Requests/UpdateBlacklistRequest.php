<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlacklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipe' => ['sometimes', 'required', 'in:email,instansi'],
            'nilai' => ['sometimes', 'required', 'string', 'max:255'],
            'alasan' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'required', 'in:aktif,nonaktif'],
        ];
    }
}
