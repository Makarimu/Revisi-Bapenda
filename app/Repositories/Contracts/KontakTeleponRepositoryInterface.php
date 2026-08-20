<?php

namespace App\Repositories\Contracts;

use App\Models\KontakTelepon;
use Illuminate\Database\Eloquent\Collection;

interface KontakTeleponRepositoryInterface
{
    public function getAll(): Collection;
    
    public function getAktif(): Collection;
    
    public function findById(int $id): ?KontakTelepon;
    
    public function create(array $data): KontakTelepon;
    
    public function update(KontakTelepon $kontak, array $data): bool;
    
    public function delete(KontakTelepon $kontak): bool;
}
