<?php

namespace App\Services;

use App\Models\Permohonan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\RingkasanService;

class DashboardService
{
    public function getStatistik(): array
    {
        $counts = Permohonan::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            'total' => array_sum($counts),
            'pending' => $counts['Pending'] ?? 0,
            'disetujui' => $counts['Disetujui'] ?? 0,
            'ditolak' => $counts['Ditolak'] ?? 0,
            'revisi' => $counts['Revisi'] ?? 0,
        ];
    }

    public function getPermohonanHariIni()
    {
        return Permohonan::where('tanggal_kunjungan', Carbon::today()->toDateString())
            ->whereIn('status', ['Disetujui', 'Pending', 'Revisi'])
            ->orderBy('jam_penerimaan', 'asc')
            ->get();
    }

    public function getGrafikBulanan(): array
    {
        $year = Carbon::now()->year;
        
        $data = Permohonan::whereYear('tanggal_kunjungan', $year)->get();
        
        $grouped = $data->groupBy(function ($item) {
            return Carbon::parse($item->tanggal_kunjungan)->format('n'); // 1-12
        });

        $result = [];
        for ($i = 1; $i <= 12; $i++) {
            $result[] = isset($grouped[$i]) ? $grouped[$i]->count() : 0;
        }

        return $result;
    }

    public function getAktivitasTerbaru()
    {
        return Permohonan::orderBy('updated_at', 'desc')->limit(5)->get();
    }

    /**
     * Daftar permohonan yang batas pengiriman ringkasan jatuh hari ini.
     * Digunakan untuk notifikasi dashboard admin.
     */
    public function getRingkasanExpiring(): array
    {
        $expiring = Permohonan::ringkasanExpiresToday()
            ->orderBy('tanggal_selesai_kunjungan', 'asc')
            ->get();

        return $expiring->map(function ($p) {
            return [
                'id'                       => $p->id,
                'kode'                     => $p->kode,
                'instansi'                 => $p->instansi,
                'tanggal_selesai_kunjungan'=> $p->tanggal_selesai_kunjungan?->toDateTimeString(),
                'batas_kirim_ringkasan'    => $p->batasKirimRingkasan()?->toDateTimeString(),
            ];
        })->toArray();
    }
}
