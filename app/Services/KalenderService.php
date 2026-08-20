<?php

namespace App\Services;

use App\Models\Permohonan;
use App\Models\TanggalDiblokir;
use Carbon\Carbon;

class KalenderService
{
    const MAKS_PER_HARI = 2;
    const MIN_HARI = 7;

    public function getMinimumVisitDate(?string $email = null): Carbon
    {
        $minDate = Carbon::today()->addDays(self::MIN_HARI);

        if (!empty($email)) {
            $cleanEmail = strtolower(trim($email));
            $latestVisit = Permohonan::whereRaw('LOWER(TRIM(email)) = ?', [$cleanEmail])
                ->whereIn('status', ['Disetujui', 'Selesai'])
                ->max('tanggal_kunjungan');

            if ($latestVisit) {
                $minFromLatest = Carbon::parse($latestVisit)->startOfDay()->addDays(self::MIN_HARI);
                if ($minFromLatest->gt($minDate)) {
                    $minDate = $minFromLatest;
                }
            }
        }

        return $minDate;
    }

    public function getUserBookedDates(?string $email = null): array
    {
        if (empty($email)) {
            return [];
        }

        $cleanEmail = strtolower(trim($email));
        return Permohonan::whereRaw('LOWER(TRIM(email)) = ?', [$cleanEmail])
            ->whereDate('tanggal_kunjungan', '>=', Carbon::today())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
            ->pluck('tanggal_kunjungan')
            ->map(fn($d) => $d ? Carbon::parse($d)->format('Y-m-d') : null)
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function isTanggalValid(string $tanggal, ?string $email = null): bool
    {
        $date = Carbon::parse($tanggal)->startOfDay();

        // 0. Validasi Email yang sama tidak boleh booking 2x pada tanggal yang sama
        if (!empty($email)) {
            $cleanEmail = strtolower(trim($email));
            $alreadyBooked = Permohonan::whereRaw('LOWER(TRIM(email)) = ?', [$cleanEmail])
                ->whereDate('tanggal_kunjungan', $date->toDateString())
                ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
                ->exists();

            if ($alreadyBooked) {
                return false;
            }
        }

        // 1. Validasi Minimal H+7 (berdasarkan tanggal pengajuan atau kunjungan terakhir email)
        $minDate = $this->getMinimumVisitDate($email);
        if ($date->lt($minDate)) {
            return false;
        }

        // 2. Validasi Hari Kerja (Senin - Jumat)
        if ($date->isWeekend()) {
            return false;
        }

        // 3. Validasi Tanggal Diblokir Manual
        $isBlocked = TanggalDiblokir::whereDate('tanggal', $date->toDateString())->exists();
        if ($isBlocked) {
            return false;
        }

        // 4. Validasi Kapasitas Penuh (>= MAKS_PER_HARI)
        // Hanya menghitung permohonan yang aktif / tidak ditolak / tidak dibatalkan
        $count = Permohonan::whereDate('tanggal_kunjungan', $date->toDateString())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
            ->count();

        if ($count >= self::MAKS_PER_HARI) {
            return false;
        }

        return true;
    }

    public function getTanggalTerpakai(): array
    {
        $diblokir = TanggalDiblokir::whereDate('tanggal', '>=', Carbon::today())
            ->get()
            ->map(fn($d) => $d->tanggal ? $d->tanggal->format('Y-m-d') : null)
            ->filter()
            ->values()
            ->toArray();
        
        $penuh = Permohonan::selectRaw('tanggal_kunjungan, count(*) as total')
            ->whereDate('tanggal_kunjungan', '>=', Carbon::today())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
            ->groupBy('tanggal_kunjungan')
            ->having('total', '>=', self::MAKS_PER_HARI)
            ->get()
            ->map(fn($p) => $p->tanggal_kunjungan ? Carbon::parse($p->tanggal_kunjungan)->format('Y-m-d') : null)
            ->filter()
            ->values()
            ->toArray();

        return array_values(array_unique(array_merge($diblokir, $penuh)));
    }
}
