<?php

namespace App\Services;

use App\Models\Permohonan;
use App\Mail\RingkasanTersediaMail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Throwable;

class HasilKunjunganService
{
    /**
     * Upload Ringkasan Hasil Kunjungan Kerja (PDF).
     * Disimpan di storage/app/public/hasil-kunjungan
     */
    public function uploadPdf(Permohonan $permohonan, UploadedFile $file, ?int $adminId = null): Permohonan
    {
        $startTime = microtime(true);

        Log::info('[HASIL KUNJUNGAN UPLOAD] Memulai proses upload PDF ringkasan', [
            'permohonan_id' => $permohonan->id,
            'kode'          => $permohonan->kode,
            'file_name'     => $file->getClientOriginalName(),
            'file_size'     => $file->getSize(),
            'mime_type'     => $file->getMimeType(),
            'admin_id'      => $adminId,
        ]);

        // Validasi Mime & Ukuran (max 10 MB)
        $mime = $file->getMimeType();
        if ($mime !== 'application/pdf' || $file->getSize() > 10 * 1024 * 1024) {
            Log::warning('[HASIL KUNJUNGAN UPLOAD GAGAL] Validasi file PDF gagal', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $permohonan->kode,
                'mime'          => $mime,
                'file_size'     => $file->getSize(),
            ]);
            throw ValidationException::withMessages([
                'pdf' => 'File harus berupa PDF dengan ukuran maksimal 10 MB.',
            ]);
        }

        return DB::transaction(function () use ($permohonan, $file, $adminId, $startTime) {
            // Hapus PDF lama jika ada
            $oldPath = $permohonan->getPdfPath();
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
                Log::info('[HASIL KUNJUNGAN UPLOAD] PDF lama dihapus', [
                    'permohonan_id' => $permohonan->id,
                    'old_path'      => $oldPath,
                ]);
            }

            // Simpan ke storage/app/public/hasil-kunjungan
            $filename    = 'hasil-' . $permohonan->kode . '-' . time() . '.pdf';
            $storagePath = 'hasil-kunjungan/' . $filename;
            Storage::disk('public')->put($storagePath, file_get_contents($file->getRealPath()));

            // Sync model attributes
            $now = Carbon::now();
            $permohonan->hasil_kunjungan_pdf         = $storagePath;
            $permohonan->ringkasan_pdf_path         = $storagePath;
            $permohonan->hasil_kunjungan_uploaded_at = $now;
            $permohonan->ringkasan_uploaded_at      = $now;
            $permohonan->hasil_kunjungan_uploaded_by = $adminId;
            $permohonan->save();

            // Queue Email Kedua
            try {
                $emailPemohon = trim((string) ($permohonan->email ?? ''));
                if (empty($emailPemohon) || !filter_var($emailPemohon, FILTER_VALIDATE_EMAIL)) {
                    Log::warning('[EMAIL KEDUA GAGAL] Alamat email pemohon kosong atau tidak valid', [
                        'permohonan_id' => $permohonan->id,
                        'kode'          => $permohonan->kode,
                        'email'         => $emailPemohon,
                    ]);
                } else {
                    Log::info('Mengirim email', [
                        'kode'   => $permohonan->kode ?? $permohonan->kode_permohonan ?? null,
                        'tujuan' => $emailPemohon,
                        'status' => 'Ringkasan PDF Tersedia',
                    ]);

                    Mail::to($emailPemohon)->send(new RingkasanTersediaMail($permohonan));
                    Log::info('[EMAIL RINGKASAN TERSEDIA TERKIRIM] Email pemberitahuan PDF tersedia berhasil dikirim', [
                        'permohonan_id' => $permohonan->id,
                        'kode'          => $permohonan->kode,
                        'email'         => $emailPemohon,
                    ]);
                }
            } catch (Throwable $e) {
                Log::error('[EMAIL KEDUA QUEUE GAGAL] Gagal membuat queue email kedua', [
                    'permohonan_id' => $permohonan->id,
                    'kode'          => $permohonan->kode,
                    'error'         => $e->getMessage(),
                ]);
            }

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::info('[HASIL KUNJUNGAN UPLOAD BERHASIL] Upload PDF selesai dan tersimpan', [
                'permohonan_id'  => $permohonan->id,
                'kode'           => $permohonan->kode,
                'storage_path'   => $storagePath,
                'execution_time' => "{$executionTime}ms",
            ]);

            return $permohonan;
        });
    }

    /**
     * Hapus PDF ringkasan hasil kunjungan.
     */
    public function deletePdf(Permohonan $permohonan): Permohonan
    {
        $path = $permohonan->getPdfPath();
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $permohonan->hasil_kunjungan_pdf         = null;
        $permohonan->ringkasan_pdf_path         = null;
        $permohonan->hasil_kunjungan_uploaded_at = null;
        $permohonan->ringkasan_uploaded_at      = null;
        $permohonan->hasil_kunjungan_uploaded_by = null;
        $permohonan->save();

        Log::info('[HASIL KUNJUNGAN HAPUS] File PDF ringkasan berhasil dihapus', [
            'permohonan_id' => $permohonan->id,
            'kode'          => $permohonan->kode,
        ]);

        return $permohonan;
    }
}
