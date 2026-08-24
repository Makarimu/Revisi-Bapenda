<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'nama' => $this->nama,
            'dinas_id' => $this->dinas_id,
            'dinas' => $this->dinas ? [
                'id' => $this->dinas->id,
                'nama' => $this->dinas->nama,
                'singkatan' => $this->dinas->singkatan,
                'nomor_telepon' => $this->dinas->nomor_telepon,
            ] : null,
        ];
    }
}
