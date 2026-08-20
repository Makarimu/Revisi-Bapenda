<?php

namespace App\Repositories;

use App\Models\TanggalDiblokir;
use App\Repositories\Contracts\TanggalDiblokirRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TanggalDiblokirRepository implements TanggalDiblokirRepositoryInterface
{
    public function getAll(): Collection
    {
        return TanggalDiblokir::orderBy('tanggal', 'desc')->get();
    }
    
    public function getAllUpcoming(): Collection
    {
        return TanggalDiblokir::upcoming()->orderBy('tanggal', 'asc')->get();
    }
    
    public function findByTanggal(string $tanggal): ?TanggalDiblokir
    {
        return TanggalDiblokir::whereDate('tanggal', $tanggal)->first();
    }
    
    public function create(array $data): TanggalDiblokir
    {
        return TanggalDiblokir::create($data);
    }
    
    public function delete(TanggalDiblokir $tanggalDiblokir): bool
    {
        return $tanggalDiblokir->delete();
    }
    
    public function deleteByTanggal(string $tanggal): bool
    {
        $record = $this->findByTanggal($tanggal);
        if ($record) {
            return $this->delete($record);
        }
        return false;
    }
}
