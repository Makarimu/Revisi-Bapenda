<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadHasilKunjunganRequest;
use App\Http\Resources\PermohonanResource;
use App\Models\Permohonan;
use App\Services\HasilKunjunganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class HasilKunjunganController extends Controller
{
    public function __construct(
        private HasilKunjunganService $hasilKunjunganService
    ) {}

    /**
     * Admin: Upload PDF Ringkasan Hasil Kunjungan Kerja.
     * POST /api/admin/permohonan/{id}/upload-pdf
     */
    public function upload(UploadHasilKunjunganRequest $request, string $id): JsonResponse
    {
        try {
            // Support pencarian via ID numerik maupun Kode registrasi
            $permohonan = is_numeric($id)
                ? Permohonan::find((int) $id)
                : Permohonan::where('kode', strtoupper($id))->first();

            if (!$permohonan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan tidak ditemukan.',
                ], 404);
            }

            $admin = $request->user();
            $file = $request->file('pdf') ?? $request->file('ringkasan_pdf');

            if (!$file) {
                return response()->json([
                    'success' => false,
                    'message' => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
                ], 422);
            }

            $updatedPermohonan = $this->hasilKunjunganService->uploadPdf($permohonan, $file, $admin?->id);

            return response()->json([
                'success' => true,
                'message' => 'Ringkasan Hasil Kunjungan Kerja (PDF) berhasil diunggah.',
                'data'    => new PermohonanResource($updatedPermohonan->load('review')),
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->validator->errors()->first('pdf') ?: $e->getMessage(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[UPLOAD PDF ERROR] Gagal mengunggah PDF ringkasan', [
                'id'      => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal mengunggah PDF ringkasan.',
            ], 500);
        }
    }

    /**
     * Admin: Hapus PDF Ringkasan Hasil Kunjungan Kerja.
     * DELETE /api/admin/permohonan/{id}/delete-pdf
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $permohonan = is_numeric($id)
            ? Permohonan::find((int) $id)
            : Permohonan::where('kode', strtoupper($id))->first();

        if (!$permohonan) {
            return response()->json([
                'success' => false,
                'message' => 'Permohonan tidak ditemukan.',
            ], 404);
        }

        $this->hasilKunjunganService->deletePdf($permohonan);

        return response()->json([
            'success' => true,
            'message' => 'PDF ringkasan berhasil dihapus.',
            'data'    => new PermohonanResource($permohonan->fresh('review')),
        ]);
    }

    /**
     * Public: Status ketersediaan PDF ringkasan permohonan.
     * GET /api/permohonan/{kode}/pdf-status
     */
    public function pdfStatus(string $kode): JsonResponse
    {
        $permohonan = Permohonan::where('kode', strtoupper($kode))->first();

        if (!$permohonan) {
            return response()->json([
                'success' => false,
                'message' => 'Permohonan tidak ditemukan.',
            ], 404);
        }

        $hasPdf = !empty($permohonan->getPdfPath()) && Storage::disk('public')->exists($permohonan->getPdfPath());

        Log::info('[API STATUS RESPONSE] Responding PDF status for ' . $permohonan->kode, [
            'kode'          => $permohonan->kode,
            'pdf_available' => $hasPdf,
            'pdf_filename'  => $hasPdf ? $permohonan->getPdfFileName() : null,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'kode'            => $permohonan->kode,
                'status'          => $permohonan->status,
                'has_pdf'         => $hasPdf,
                'pdf_available'   => $hasPdf,
                'nama_file'       => $hasPdf ? $permohonan->getPdfFileName() : null,
                'pdf_filename'    => $hasPdf ? $permohonan->getPdfFileName() : null,
                'ukuran_file'     => $hasPdf ? $permohonan->getPdfFileSizeFormatted() : null,
                'uploaded_at'     => $hasPdf ? $permohonan->getPdfUploadedAt()?->toDateTimeString() : null,
                'pdf_uploaded_at' => $hasPdf ? $permohonan->getPdfUploadedAt()?->toDateTimeString() : null,
                'download_url'    => $hasPdf ? url("/api/permohonan/{$permohonan->kode}/download-pdf") : null,
                'pdf_url'         => $hasPdf ? url("/api/permohonan/{$permohonan->kode}/download-pdf") : null,
            ],
        ]);
    }

    /**
     * Public: Download langsung PDF Ringkasan Hasil Kunjungan.
     * GET /api/permohonan/{kode}/download-pdf
     */
    public function downloadPdf(string $kode): BinaryFileResponse|JsonResponse
    {
        $permohonan = Permohonan::where('kode', strtoupper($kode))->first();

        if (!$permohonan) {
            Log::warning('[DOWNLOAD PDF GAGAL] Permohonan tidak ditemukan', ['kode' => $kode]);
            return response()->json([
                'success' => false,
                'message' => 'Permohonan tidak ditemukan.',
            ], 404);
        }

        $pdfPath = $permohonan->getPdfPath();

        if (empty($pdfPath) || !Storage::disk('public')->exists($pdfPath)) {
            Log::warning('[DOWNLOAD PDF GAGAL] Dokumen PDF belum tersedia', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $permohonan->kode,
                'pdf_path'      => $pdfPath,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ringkasan Hasil Kunjungan Kerja (PDF) belum tersedia.',
            ], 404);
        }

        Log::info('[DOWNLOAD PDF BERHASIL] Pemohon mengunduh PDF ringkasan', [
            'permohonan_id' => $permohonan->id,
            'kode'          => $permohonan->kode,
            'pdf_path'      => $pdfPath,
        ]);

        $fullPath = Storage::disk('public')->path($pdfPath);
        $downloadFileName = 'Ringkasan-Hasil-Kunjungan.pdf';

        return response()->download($fullPath, $downloadFileName, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
