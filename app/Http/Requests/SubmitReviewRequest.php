<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'review' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required'  => 'Rating wajib dipilih.',
            'rating.integer'   => 'Rating harus berupa angka.',
            'rating.between'   => 'Rating harus antara 1 sampai 5.',
            'review.required'  => 'Ulasan wajib diisi.',
            'review.min'       => 'Ulasan minimal 10 karakter.',
            'review.max'       => 'Ulasan maksimal 1000 karakter.',
        ];
    }
}
