<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TambahKontakTeleponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nomor_telepon' => ['required', 'string', 'max:20'],
            'nama_pic' => ['required', 'string', 'max:150'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
