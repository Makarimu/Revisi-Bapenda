<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BlokirTanggalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date_format:Y-m-d'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
