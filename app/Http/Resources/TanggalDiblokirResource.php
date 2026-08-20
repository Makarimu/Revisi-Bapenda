<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TanggalDiblokirResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tanggal' => $this->tanggal->toDateString(),
            'keterangan' => $this->keterangan,
            'diblokir_oleh' => $this->diblokir_oleh,
            'tgl_diblokir' => $this->tgl_diblokir,
        ];
    }
}
