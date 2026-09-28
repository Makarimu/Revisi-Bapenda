<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BlokirTanggalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $dinasId = $this->user()?->dinas_id;

        return [
            'tanggal' => [
                'required',
                'date_format:Y-m-d',
                Rule::unique('app_tanggal_diblokir', 'tanggal')->where(function ($query) use ($dinasId) {
                    if ($dinasId) {
                        return $query->where('dinas_id', $dinasId);
                    }
                    return $query->whereNull('dinas_id');
                }),
            ],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal.unique' => 'Tanggal ini sudah diblokir untuk dinas Anda.',
        ];
    }
}
