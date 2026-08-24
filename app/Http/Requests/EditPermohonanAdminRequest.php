<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EditPermohonanAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if (empty($this->dinas_id) && !empty($this->dinas_tujuan)) {
            $cleanDinasTujuan = strtolower(trim($this->dinas_tujuan));
            $dinas = \App\Models\Dinas::whereRaw('LOWER(singkatan) = ?', [$cleanDinasTujuan])
                ->orWhereRaw('LOWER(nama) = ?', [$cleanDinasTujuan])
                ->orWhereRaw('LOWER(nama) LIKE ?', ["%{$cleanDinasTujuan}%"])
                ->first();
                
            if ($dinas) {
                $this->merge([
                    'dinas_id' => $dinas->id,
                ]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'tanggal_kunjungan' => ['required', 'date'],
            'nomor_surat' => ['required', 'string', 'max:100'],
            'instansi' => ['required', 'string', 'max:200'],
            'nama_ketua_rombongan' => ['required', 'string', 'max:150'],
            'jabatan_ketua_rombongan' => ['required', 'string', 'max:150'],
            'nama_pic' => ['required', 'string', 'max:150'],
            'jabatan_pic' => ['required', 'string', 'max:150'],
            'no_telp' => ['required', 'string', 'min:10', 'max:20'],
            'email' => ['required', 'email', 'max:150'],
            'tujuan' => ['required', 'string'],
            'dinas_id' => ['required', 'exists:app_md_dinas,id'],
            'jumlah_peserta' => ['required', 'integer', 'min:1'],
            'rencana_menginap' => ['required', 'in:Ya,Tidak'],
            'nama_hotel' => ['required_if:rencana_menginap,Ya', 'nullable', 'string', 'max:200'],
        ];
    }
}
