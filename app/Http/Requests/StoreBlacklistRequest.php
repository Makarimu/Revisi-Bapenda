<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlacklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipe' => ['required', 'in:email,instansi'],
            'nilai' => ['required', 'string', 'max:255'],
            'alasan' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ];
    }
}
