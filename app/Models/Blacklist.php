<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Blacklist extends Model
{
    use HasFactory;

    protected $table = 'app_blacklist';

    protected $fillable = [
        'tipe',
        'nilai',
        'alasan',
        'status',
        'created_by',
    ];

    protected function nilai(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => trim($value),
        );
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Cek apakah email atau instansi ada dalam daftar blacklist aktif.
     * Mengembalikan model Blacklist jika terdeteksi, atau null jika aman.
     */
    public static function checkBlacklist(?string $email, ?string $instansi = null): ?self
    {
        // 1. Cek Email
        if (!empty($email)) {
            $cleanEmail = strtolower(trim($email));
            $foundEmail = self::aktif()
                ->where('tipe', 'email')
                ->whereRaw('LOWER(TRIM(nilai)) = ?', [$cleanEmail])
                ->first();

            if ($foundEmail) {
                return $foundEmail;
            }
        }

        // 2. Cek Instansi
        if (!empty($instansi)) {
            $cleanInstansi = strtolower(trim($instansi));
            $foundInstansi = self::aktif()
                ->where('tipe', 'instansi')
                ->where(function ($q) use ($cleanInstansi) {
                    $q->whereRaw('LOWER(TRIM(nilai)) = ?', [$cleanInstansi])
                      ->orWhereRaw('? LIKE CONCAT("%", LOWER(TRIM(nilai)), "%")', [$cleanInstansi]);
                })
                ->first();

            if ($foundInstansi) {
                return $foundInstansi;
            }
        }

        return null;
    }
}
