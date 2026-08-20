<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PermohonanService;
use App\Http\Requests\ProsesPermohonanRequest;
use App\Http\Requests\EditPermohonanAdminRequest;
use App\Http\Requests\ExportPermohonanRequest;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use App\Http\Resources\PermohonanResource;
use App\Exports\PermohonanExport;
use App\Models\ExportAuditLog;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class PermohonanAdminController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService,
        private PermohonanRepositoryInterface $permohonanRepo
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['status', 'search', 'start_date', 'end_date']);
        $permohonan = $this->permohonanRepo->getAll($filters);
        
        return PermohonanResource::collection($permohonan);
    }

    public function show($kode)
    {
        $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));

        if (!$permohonan) {
            return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => new PermohonanResource($permohonan)]);
    }

    public function proses(ProsesPermohonanRequest $request, $kode)
    {
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
            
            if (!$permohonan) {
                return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan'], 404);
            }

            $adminName = $request->user()->nama;
            $permohonan = $this->permohonanService->prosesAdmin($permohonan, $request->validated(), $adminName);
            
            return response()->json([
                'success' => true,
                'message' => 'Permohonan berhasil diproses.',
                'data' => new PermohonanResource($permohonan)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function selesaikan(Request $request, $kode)
    {
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
            
            if (!$permohonan) {
                return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan'], 404);
            }

            $adminName = $request->user()->nama ?? $request->user()->name ?? 'Admin';
            $permohonan = $this->permohonanService->selesaikan($permohonan, $adminName);
            
            return response()->json([
                'success' => true,
                'message' => 'Kunjungan berhasil diselesaikan.',
                'data' => new PermohonanResource($permohonan)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function update(EditPermohonanAdminRequest $request, $kode)
    {
        // ... (This function remains as edit for admin if needed, mostly update repo directly)
        $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
        
        if (!$permohonan) {
            return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan'], 404);
        }

        $this->permohonanRepo->update($permohonan, $request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Data permohonan berhasil diperbarui.',
            'data' => new PermohonanResource($permohonan->fresh())
        ]);
    }

    public function destroy($kode)
    {
        $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
        
        if (!$permohonan) {
            return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan'], 404);
        }

        $this->permohonanService->delete($permohonan);
        
        return response()->json([
            'success' => true,
            'message' => 'Permohonan berhasil dihapus.'
        ]);
    }

    public function export(ExportPermohonanRequest $request)
    {
        $validated = $request->validated();

        // Build filters for repository
        $filters = [];

        if (($validated['rentang'] ?? 'semua') === 'tanggal') {
            $filters['start_date'] = $validated['start_date'] ?? null;
            $filters['end_date']   = $validated['end_date']   ?? null;
        }

        if (!empty($validated['status']) && !in_array('Semua', $validated['status'])) {
            $filters['status'] = $validated['status'];
        }

        $data = $this->permohonanRepo->getExportData($filters);

        // Return empty response if no data
        if ($data->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang dapat diexport.',
            ], 422);
        }

        // Record audit log
        $admin = $request->user();
        ExportAuditLog::create([
            'admin_id'    => $admin?->id,
            'admin_name'  => $admin?->nama ?? $admin?->name ?? 'Admin',
            'waktu_export'=> Carbon::now(),
            'jumlah_data' => $data->count(),
            'filter_used' => json_encode($filters),
        ]);

        // Generate filename
        $filename = 'permohonan_kunjungan_' . Carbon::now()->format('Y-m-d_H-i') . '.xlsx';

        return Excel::download(new PermohonanExport($data), $filename);
    }
}

