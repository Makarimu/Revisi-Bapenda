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

    public function getUserBookedDates(?string $email = null, ?int $dinasId = null): array
    {
        if (empty($email)) {
            return [];
        }

        $cleanEmail = strtolower(trim($email));
        $query = Permohonan::whereRaw('LOWER(TRIM(email)) = ?', [$cleanEmail])
            ->whereDate('tanggal_kunjungan', '>=', Carbon::today())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan']);

        if (!empty($dinasId)) {
            // Batas per akun adalah maksimal 2 kali per kedinasan/kecamatan di hari tersebut
            return $query->where('dinas_id', $dinasId)
                ->groupBy('tanggal_kunjungan')
                ->havingRaw('COUNT(*) >= 2')
                ->pluck('tanggal_kunjungan')
                ->map(fn($d) => $d ? Carbon::parse($d)->format('Y-m-d') : null)
                ->filter()
                ->values()
                ->toArray();
        }

        return [];
    }

    public function isTanggalValid(string $tanggal, ?string $email = null, ?int $dinasId = null): bool
    {
        $date = Carbon::parse($tanggal)->startOfDay();

        // 0. Validasi Email: Maksimal 2x per kedinasan/kecamatan pada tanggal yang sama
        if (!empty($email) && !empty($dinasId)) {
            $cleanEmail = strtolower(trim($email));
            $dinasCount = Permohonan::whereRaw('LOWER(TRIM(email)) = ?', [$cleanEmail])
                ->where('dinas_id', $dinasId)
                ->whereDate('tanggal_kunjungan', $date->toDateString())
                ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
                ->count();

            if ($dinasCount >= 2) {
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

        // 4. Validasi Kapasitas Penuh (>= MAKS_PER_HARI per dinas / global)
        // Hanya menghitung permohonan yang aktif / tidak ditolak / tidak dibatalkan
        $countQuery = Permohonan::whereDate('tanggal_kunjungan', $date->toDateString())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan']);

        if (!empty($dinasId)) {
            $countQuery->where('dinas_id', $dinasId);
        }

        $count = $countQuery->count();

        if ($count >= config('visit.max_per_hari', 100)) {
            return false;
        }

        return true;
    }

    public function getTanggalTerpakai(?int $dinasId = null): array
    {
        $diblokir = TanggalDiblokir::whereDate('tanggal', '>=', Carbon::today())
            ->get()
            ->map(fn($d) => $d->tanggal ? $d->tanggal->format('Y-m-d') : null)
            ->filter()
            ->values()
            ->toArray();
        
        $penuhQuery = Permohonan::selectRaw('tanggal_kunjungan, count(*) as total')
            ->whereDate('tanggal_kunjungan', '>=', Carbon::today())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan']);

        if (!empty($dinasId)) {
            $penuhQuery->where('dinas_id', $dinasId);
        }

        $penuh = $penuhQuery->groupBy('tanggal_kunjungan')
            ->having('total', '>=', config('visit.max_per_hari', 100))
            ->get()
            ->map(fn($p) => $p->tanggal_kunjungan ? Carbon::parse($p->tanggal_kunjungan)->format('Y-m-d') : null)
            ->filter()
            ->values()
            ->toArray();

        return array_values(array_unique(array_merge($diblokir, $penuh)));
    }
}
