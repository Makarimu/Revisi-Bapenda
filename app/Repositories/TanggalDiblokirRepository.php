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
    
    public function getAllUpcoming(?int $dinasId = null): Collection
    {
        $query = TanggalDiblokir::upcoming()->orderBy('tanggal', 'asc');
        if ($dinasId) {
            $query->where(function($q) use ($dinasId) {
                $q->whereNull('dinas_id')->orWhere('dinas_id', $dinasId);
            });
        }
        return $query->get();
    }
    
    public function findByTanggal(string $tanggal, ?int $dinasId = null): ?TanggalDiblokir
    {
        $query = TanggalDiblokir::whereDate('tanggal', $tanggal);
        if ($dinasId) {
            $query->where('dinas_id', $dinasId);
        } else {
            $query->whereNull('dinas_id');
        }
        return $query->first();
    }
    
    public function create(array $data): TanggalDiblokir
    {
        return TanggalDiblokir::create($data);
    }
    
    public function delete(TanggalDiblokir $tanggalDiblokir): bool
    {
        return $tanggalDiblokir->delete();
    }
    
    public function deleteByTanggal(string $tanggal, ?int $dinasId = null): bool
    {
        $record = $this->findByTanggal($tanggal, $dinasId);
        if ($record) {
            return $this->delete($record);
        }
        return false;
    }
}
