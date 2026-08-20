<?php

namespace App\Repositories;

use App\Models\KontakTelepon;
use App\Repositories\Contracts\KontakTeleponRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class KontakTeleponRepository implements KontakTeleponRepositoryInterface
{
    public function getAll(): Collection
    {
        return KontakTelepon::orderBy('created_at', 'desc')->get();
    }
    
    public function getAktif(): Collection
    {
        return KontakTelepon::aktif()->orderBy('created_at', 'desc')->get();
    }
    
    public function findById(int $id): ?KontakTelepon
    {
        return KontakTelepon::find($id);
    }
    
    public function create(array $data): KontakTelepon
    {
        return KontakTelepon::create($data);
    }
    
    public function update(KontakTelepon $kontak, array $data): bool
    {
        return $kontak->update($data);
    }
    
    public function delete(KontakTelepon $kontak): bool
    {
        return $kontak->delete();
    }
}
