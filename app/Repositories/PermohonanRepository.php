<?php

namespace App\Repositories;

use App\Models\Permohonan;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PermohonanRepository implements PermohonanRepositoryInterface
{
    public function findByKode(string $kode): ?Permohonan
    {
        return Permohonan::where('kode', $kode)->with('review')->first();
    }
    
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Permohonan::query()->orderBy('created_at', 'desc');
        
        if (isset($filters['status']) && $filters['status'] !== 'Semua') {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama_pic', 'like', "%{$search}%")
                  ->orWhere('instansi', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $query->whereDate('tanggal_kunjungan', '>=', $filters['start_date']);
        }
        
        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $query->whereDate('tanggal_kunjungan', '<=', $filters['end_date']);
        }
        
        return $query->paginate($filters['per_page'] ?? 15);
    }
    
    public function create(array $data): Permohonan
    {
        return Permohonan::create($data);
    }
    
    public function update(Permohonan $permohonan, array $data): bool
    {
        return $permohonan->update($data);
    }
    
    public function delete(Permohonan $permohonan): bool
    {
        return $permohonan->delete();
    }
    
    public function getTanggalTerpakai(): array
    {
        $tanggalPenuh = Permohonan::select('tanggal_kunjungan')
            ->whereDate('tanggal_kunjungan', '>=', Carbon::today())
            ->whereNotIn('status', ['Ditolak', 'Dibatalkan'])
            ->groupBy('tanggal_kunjungan')
            ->havingRaw('COUNT(*) >= 2')
            ->get()
            ->map(fn($p) => $p->tanggal_kunjungan ? Carbon::parse($p->tanggal_kunjungan)->format('Y-m-d') : null)
            ->filter()
            ->values()
            ->toArray();
            
        return $tanggalPenuh;
    }

    public function getStatistik(): array
    {
        $totals = Permohonan::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')->toArray();

        $allTotal = array_sum($totals);

        return [
            'total' => $allTotal,
            'pending' => $totals['Pending'] ?? 0,
            'revisi' => $totals['Revisi'] ?? 0,
            'disetujui' => $totals['Disetujui'] ?? 0,
            'ditolak' => $totals['Ditolak'] ?? 0,
        ];
    }
    
    public function getHariIni(): array
    {
        return Permohonan::whereDate('tanggal_kunjungan', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
    
    public function getGrafikBulanan(): array
    {
        $year = Carbon::now()->year;
        
        $records = Permohonan::whereYear('tanggal_kunjungan', $year)->get(['tanggal_kunjungan']);
        $grouped = $records->groupBy(function ($item) {
            return (int) Carbon::parse($item->tanggal_kunjungan)->format('n');
        });

        $result = [];
        for ($i = 1; $i <= 12; $i++) {
            $result[] = isset($grouped[$i]) ? $grouped[$i]->count() : 0;
        }

        return $result;
    }
    
    public function getAktivitasTerbaru(): array
    {
        return Permohonan::orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    public function getExportData(array $filters): \Illuminate\Support\Collection
    {
        $query = Permohonan::query()->orderBy('created_at', 'asc');

        // Filter status (array of statuses)
        if (!empty($filters['status']) && is_array($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        // Filter tanggal pengajuan (created_at range)
        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return $query->get();
    }
}

