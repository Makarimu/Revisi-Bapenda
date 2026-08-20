<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\RingkasanService;
use App\Services\DashboardService;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use App\Http\Resources\PermohonanResource;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RingkasanController extends Controller
{
    public function __construct(
        private RingkasanService $ringkasanService,
        private DashboardService $dashboardService,
        private PermohonanRepositoryInterface $permohonanRepo
    ) {}

    /**
     * Upload PDF ringkasan untuk permohonan.
     * POST /api/admin/permohonan/{kode}/ringkasan/upload
     */
    public function upload(Request $request, string $kode)
    {
        $request->validate([
            'ringkasan_pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'], // max 10 MB
        ]);

        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));

            if (!$permohonan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan tidak ditemukan.',
                ], 404);
            }

            $permohonan = $this->ringkasanService->uploadPdf(
                $permohonan,
                $request->file('ringkasan_pdf')
            );

            return response()->json([
                'success' => true,
                'message' => 'PDF ringkasan berhasil diunggah.',
                'data'    => new PermohonanResource($permohonan->load('review')),
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload PDF ringkasan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kirim email ringkasan PDF ke pemohon.
     * POST /api/admin/permohonan/{kode}/ringkasan/kirim
     */
    public function kirim(Request $request, string $kode)
    {
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));

            if (!$permohonan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan tidak ditemukan.',
                ], 404);
            }

            $adminName  = $request->user()->nama ?? $request->user()->name ?? 'Admin';
            $permohonan = $this->ringkasanService->kirimRingkasan($permohonan, $adminName);

            return response()->json([
                'success' => true,
                'message' => 'Ringkasan berhasil dikirim ke ' . $permohonan->email,
                'data'    => new PermohonanResource($permohonan->load('review')),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email ringkasan. Silakan coba lagi. Detail: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Daftar permohonan yang batas pengiriman ringkasan jatuh hari ini.
     * GET /api/admin/ringkasan/expiring
     */
    public function expiring()
    {
        $expiring = $this->dashboardService->getRingkasanExpiring();

        return response()->json([
            'success' => true,
            'message' => count($expiring) > 0
                ? 'Ada ' . count($expiring) . ' permohonan yang batas pengiriman ringkasan jatuh hari ini.'
                : 'Tidak ada permohonan dengan batas ringkasan hari ini.',
            'data'    => $expiring,
        ]);
    }
}
