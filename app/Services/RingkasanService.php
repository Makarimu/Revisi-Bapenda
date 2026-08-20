<?php

namespace App\Services;

use App\Models\Permohonan;
use App\Mail\RingkasanPdfMail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Throwable;

class RingkasanService
{
    /**
     * Upload PDF ringkasan hasil kunjungan.
     * Hanya boleh PDF, maksimum 10 MB.
     */
    public function uploadPdf(Permohonan $permohonan, UploadedFile $file): Permohonan
    {
        $startTime = microtime(true);

        Log::info('[RINGKASAN UPLOAD] Memulai upload PDF ringkasan', [
            'permohonan_id' => $permohonan->id,
            'kode'          => $permohonan->kode,
            'status'        => $permohonan->status,
            'file_name'     => $file->getClientOriginalName(),
            'file_size_kb'  => round($file->getSize() / 1024, 2),
        ]);

        // Validasi mime type: hanya PDF
        $mime = $file->getMimeType();
        if ($mime !== 'application/pdf') {
            Log::warning('[RINGKASAN UPLOAD GAGAL] File bukan PDF', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $permohonan->kode,
                'mime'          => $mime,
            ]);
            throw ValidationException::withMessages([
                'ringkasan_pdf' => 'File ringkasan harus berupa PDF.',
            ]);
        }

        // Validasi ukuran: maksimum 10 MB
        if ($file->getSize() > 10 * 1024 * 1024) {
            Log::warning('[RINGKASAN UPLOAD GAGAL] File melebihi 10 MB', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $permohonan->kode,
                'file_size_mb'  => round($file->getSize() / 1024 / 1024, 2),
            ]);
            throw ValidationException::withMessages([
                'ringkasan_pdf' => 'Ukuran file PDF ringkasan maksimal 10 MB.',
            ]);
        }

        // Hapus PDF lama jika ada
        if ($permohonan->ringkasan_pdf_path) {
            Storage::disk('public')->delete($permohonan->ringkasan_pdf_path);
            Log::info('[RINGKASAN UPLOAD] PDF lama dihapus', [
                'permohonan_id' => $permohonan->id,
                'path_lama'     => $permohonan->ringkasan_pdf_path,
            ]);
        }

        // Simpan PDF baru
        $safeName   = 'ringkasan-' . $permohonan->kode . '-' . time();
        $storagePath = 'ringkasan/' . $safeName . '.pdf';
        Storage::disk('public')->put($storagePath, file_get_contents($file->getRealPath()));

        // Update model (sync both fields)
        $now = Carbon::now();
        $permohonan->ringkasan_pdf_path        = $storagePath;
        $permohonan->hasil_kunjungan_pdf      = $storagePath;
        $permohonan->ringkasan_uploaded_at     = $now;
        $permohonan->hasil_kunjungan_uploaded_at = $now;
        $permohonan->save();

        $executionTime = round((microtime(true) - $startTime) * 1000, 2);
        Log::info('[RINGKASAN UPLOAD BERHASIL] PDF berhasil diunggah', [
            'permohonan_id'  => $permohonan->id,
            'kode'           => $permohonan->kode,
            'storage_path'   => $storagePath,
            'execution_time' => "{$executionTime}ms",
        ]);

        return $permohonan;
    }

    /**
     * Kirim email ringkasan PDF ke pemohon.
     * Validasi: status Selesai, ada review, ada PDF, belum melewati batas 3 hari.
     */
    public function kirimRingkasan(Permohonan $permohonan, string $adminName): Permohonan
    {
        $startTime = microtime(true);
        $kode  = $permohonan->kode;
        $email = $permohonan->email;

        Log::info('[RINGKASAN KIRIM] Admin meminta pengiriman ringkasan', [
            'permohonan_id' => $permohonan->id,
            'kode'          => $kode,
            'admin'         => $adminName,
            'email_pemohon' => $email,
            'status'        => $permohonan->status,
        ]);

        // ── Validasi 1: Status harus Selesai ─────────────────────────────
        if ($permohonan->status !== 'Selesai') {
            Log::warning('[RINGKASAN KIRIM GAGAL] Status bukan Selesai', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $kode,
                'status'        => $permohonan->status,
            ]);
            throw ValidationException::withMessages([
                'ringkasan' => 'Ringkasan hanya dapat dikirim untuk permohonan berstatus Selesai.',
            ]);
        }

        // ── Validasi 2: Rating & Review sudah dikirim ───────────────────
        $hasReview = $permohonan->review()->exists();
        if (!$hasReview) {
            Log::warning('[RINGKASAN KIRIM GAGAL] Pemohon belum mengirim Rating & Review', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $kode,
            ]);
            throw ValidationException::withMessages([
                'ringkasan' => 'Ringkasan belum dapat dikirim. Pemohon belum mengirimkan Rating & Review.',
            ]);
        }

        // ── Validasi 3: PDF sudah diunggah ───────────────────────────────
        if (empty($permohonan->ringkasan_pdf_path)) {
            Log::warning('[RINGKASAN KIRIM GAGAL] PDF ringkasan belum diunggah', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $kode,
            ]);
            throw ValidationException::withMessages([
                'ringkasan' => 'PDF ringkasan belum diunggah. Silakan upload terlebih dahulu.',
            ]);
        }

        // ── Validasi 4: Belum melewati batas 3 hari ──────────────────────
        if (!$permohonan->isBelumMelampauiBatas()) {
            $batas = $permohonan->batasKirimRingkasan();
            Log::warning('[RINGKASAN KIRIM GAGAL] Batas 3 hari telah terlampaui', [
                'permohonan_id'       => $permohonan->id,
                'kode'                => $kode,
                'tanggal_selesai'     => $permohonan->tanggal_selesai_kunjungan,
                'batas_pengiriman'    => $batas?->toDateTimeString(),
                'sekarang'            => now()->toDateTimeString(),
            ]);
            throw ValidationException::withMessages([
                'ringkasan' => 'Batas maksimal pengiriman ringkasan (3 hari sejak selesai kunjungan) telah terlampaui.',
            ]);
        }

        // ── Validasi 5: Cek email pemohon valid ──────────────────────────
        if (empty(trim($email)) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Log::warning('[RINGKASAN KIRIM GAGAL] Email pemohon tidak valid', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $kode,
                'email'         => $email,
            ]);
            throw ValidationException::withMessages([
                'ringkasan' => 'Alamat email pemohon tidak valid.',
            ]);
        }

        // ── Kirim Email ───────────────────────────────────────────────────
        try {
            Log::info('Mengirim email', [
                'kode'   => $kode,
                'tujuan' => $email,
                'status' => 'Ringkasan PDF Terkirim',
            ]);

            Log::info('[RINGKASAN EMAIL DIKIRIM] Mengirim email ringkasan via SMTP', [
                'permohonan_id' => $permohonan->id,
                'kode'          => $kode,
                'email'         => $email,
                'admin'         => $adminName,
                'pdf_path'      => $permohonan->ringkasan_pdf_path,
            ]);

            Mail::to($email)->send(new RingkasanPdfMail($permohonan));

            // Update status & metadata pengiriman
            $permohonan->ringkasan_sent_at  = Carbon::now();
            $permohonan->ringkasan_sent_by  = $adminName;
            $permohonan->status             = 'Ringkasan_Terkirim';
            $permohonan->save();

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::info('[RINGKASAN EMAIL BERHASIL] Email ringkasan berhasil dikirim', [
                'permohonan_id'  => $permohonan->id,
                'kode'           => $kode,
                'email'          => $email,
                'admin'          => $adminName,
                'waktu_kirim'    => $permohonan->ringkasan_sent_at->toDateTimeString(),
                'execution_time' => "{$executionTime}ms",
            ]);

        } catch (Throwable $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error('[RINGKASAN EMAIL GAGAL] Exception saat mengirim email ringkasan', [
                'permohonan_id'   => $permohonan->id,
                'kode'            => $kode,
                'email'           => $email,
                'admin'           => $adminName,
                'execution_time'  => "{$executionTime}ms",
                'exception_class' => get_class($e),
                'exception_code'  => $e->getCode(),
                'message'         => $e->getMessage(),
                'file'            => $e->getFile(),
                'line'            => $e->getLine(),
                'stack_trace'     => $e->getTraceAsString(),
            ]);

            // Jangan ubah status dan jangan hapus PDF saat email gagal
            throw $e;
        }

        return $permohonan;
    }

    /**
     * Ambil daftar permohonan yang batas pengiriman ringkasan adalah HARI INI.
     * Digunakan untuk notifikasi dashboard admin.
     */
    public function getRingkasanExpiring(): \Illuminate\Database\Eloquent\Collection
    {
        return Permohonan::ringkasanExpiresToday()
            ->with('review')
            ->orderBy('tanggal_selesai_kunjungan', 'asc')
            ->get();
    }
}
