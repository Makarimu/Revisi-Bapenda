<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UploadHasilKunjunganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pdf' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'pdf.required'  => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
            'pdf.file'      => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
            'pdf.mimetypes' => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
            'pdf.max'       => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
