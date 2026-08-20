<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function statistik()
    {
        $stats = $this->dashboardService->getStatistik();
        // Ubah ke format dengan huruf kapital agar konsisten dengan frontend
        return response()->json([
            'success' => true,
            'data' => [
                'Total'    => $stats['total'],
                'Pending'  => $stats['pending'],
                'Disetujui'=> $stats['disetujui'],
                'Ditolak'  => $stats['ditolak'],
                'Revisi'   => $stats['revisi'],
            ]
        ]);
    }

    public function permohonanHariIni()
    {
        return response()->json([
            'success' => true,
            'data' => $this->dashboardService->getPermohonanHariIni()
        ]);
    }

    public function grafikBulanan()
    {
        return response()->json([
            'success' => true,
            'data' => $this->dashboardService->getGrafikBulanan()
        ]);
    }

    public function aktivitasTerbaru()
    {
        return response()->json([
            'success' => true,
            'data' => $this->dashboardService->getAktivitasTerbaru()
        ]);
    }
}
