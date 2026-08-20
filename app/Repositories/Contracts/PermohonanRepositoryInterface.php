<?php

namespace App\Repositories\Contracts;

use App\Models\Permohonan;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PermohonanRepositoryInterface
{
    public function findByKode(string $kode): ?Permohonan;
    
    public function getAll(array $filters): LengthAwarePaginator;
    
    public function create(array $data): Permohonan;
    
    public function update(Permohonan $permohonan, array $data): bool;
    
    public function delete(Permohonan $permohonan): bool;
    
    public function getTanggalTerpakai(): array;

    public function getStatistik(): array;
    
    public function getHariIni(): array;
    
    public function getGrafikBulanan(): array;
    
    public function getAktivitasTerbaru(): array;

    public function getExportData(array $filters): Collection;
}

