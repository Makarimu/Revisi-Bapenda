<?php

namespace App\Services;

use App\Models\Permohonan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\RingkasanService;

class DashboardService
{
    private function applyDinasFilter($query)
    {
        if (auth()->check() && auth()->user()->dinas_id !== null) {
            $query->where('dinas_id', auth()->user()->dinas_id);
        }
        return $query;
    }

    public function getStatistik(): array
    {
        $query = Permohonan::select('status', DB::raw('count(*) as total'));
        $this->applyDinasFilter($query);
        $counts = $query->groupBy('status')
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
        $query = Permohonan::where('tanggal_kunjungan', Carbon::today()->toDateString())
            ->whereIn('status', ['Disetujui', 'Pending', 'Revisi'])
            ->orderBy('jam_penerimaan', 'asc');
        $this->applyDinasFilter($query);
        return $query->get();
    }

    public function getGrafikBulanan(): array
    {
        $year = Carbon::now()->year;
        
        $query = Permohonan::whereYear('tanggal_kunjungan', $year);
        $this->applyDinasFilter($query);
        $data = $query->get();
        
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
        $query = Permohonan::orderBy('updated_at', 'desc')->limit(5);
        $this->applyDinasFilter($query);
        return $query->get();
    }

    /**
     * Daftar permohonan yang batas pengiriman ringkasan jatuh hari ini.
     * Digunakan untuk notifikasi dashboard admin.
     */
    public function getRingkasanExpiring(): array
    {
        $query = Permohonan::ringkasanExpiresToday()
            ->orderBy('tanggal_selesai_kunjungan', 'asc');
        $this->applyDinasFilter($query);
        $expiring = $query->get();

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
