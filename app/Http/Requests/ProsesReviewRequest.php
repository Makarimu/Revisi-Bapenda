<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProsesReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aksi' => ['required', 'string', 'in:approve,reject'],
        ];
    }

    public function messages(): array
    {
        return [
            'aksi.required' => 'Aksi wajib ditentukan.',
            'aksi.in'       => 'Aksi harus berupa approve atau reject.',
        ];
    }
}
