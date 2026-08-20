<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProsesPermohonanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aksi' => ['required', 'in:acc,tolak'],
            'narasumber' => ['nullable', 'string', 'max:200'],
            'jam_penerimaan' => ['nullable', 'string', 'max:20'],
            'keterangan' => ['required_if:aksi,tolak', 'nullable', 'string'],
            'bisa_revisi' => ['required_if:aksi,tolak', 'nullable', 'in:Ya,Tidak'],
        ];
    }
}
