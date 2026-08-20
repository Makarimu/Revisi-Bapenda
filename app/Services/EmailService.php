<?php

namespace App\Services;

use App\Models\Permohonan;
use App\Models\KontakTelepon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\PermohonanPendingMail;
use App\Mail\PermohonanDisetujuiMail;
use App\Mail\PermohonanDitolakMail;
use App\Mail\PermohonanRevisiMail;
use App\Mail\KunjunganSelesaiMail;
use Throwable;

class EmailService
{
    /**
     * Mengirim email status permohonan ke pemohon secara synchronous (langsung via SMTP).
     * Tidak melempar exception agar kegagalan SMTP tidak membatalkan simpan data/perubahan status.
     */
    public function sendStatusEmail(Permohonan $permohonan): bool
    {
        $startTime = microtime(true);
        $id = $permohonan->id ?? null;
        $kode = $permohonan->kode ?? 'N/A';
        $status = $permohonan->status ?? 'Unknown';
        $email = trim((string) ($permohonan->email ?? ''));

        Log::info("[STATUS BERUBAH] Permohonan {$kode} (ID: {$id}) berstatus: '{$status}'");

        // 1. Validasi Email (cek kosong, format email, email invalid)
        if (empty($email)) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::warning("[EMAIL GAGAL] Alamat email kosong untuk permohonan {$kode} (ID: {$id})", [
                'permohonan_id'  => $id,
                'kode'           => $kode,
                'status'         => $status,
                'email'          => $email,
                'execution_time' => "{$executionTime}ms",
                'reason'         => 'Email address is empty',
            ]);
            return false;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::warning("[EMAIL GAGAL] Format email tidak valid: '{$email}' untuk permohonan {$kode} (ID: {$id})", [
                'permohonan_id'  => $id,
                'kode'           => $kode,
                'status'         => $status,
                'email'          => $email,
                'execution_time' => "{$executionTime}ms",
                'reason'         => 'Invalid email format',
            ]);
            return false;
        }

        Log::info('Mengirim email', [
            'kode'   => $permohonan->kode ?? $permohonan->kode_permohonan ?? null,
            'tujuan' => $email,
            'status' => $status,
        ]);

        Log::info("[EMAIL AKAN DIKIRIM] Memulai pengiriman email ke '{$email}' untuk permohonan {$kode} (Status: {$status})");

        try {
            // 2. Mailable Selection untuk 5 status (Pending, Disetujui, Ditolak, Ditolak dengan Revisi, Selesai)
            $mailable = null;

            if ($status === 'Pending') {
                $mailable = new PermohonanPendingMail($permohonan);
            } elseif ($status === 'Disetujui') {
                $kontakAktif = KontakTelepon::aktif()->get();
                $mailable = new PermohonanDisetujuiMail($permohonan, $kontakAktif);
            } elseif ($status === 'Ditolak') {
                // Pembeda antara Ditolak Murni vs Ditolak dengan Revisi
                if (($permohonan->bisa_direvisi ?? 'Tidak') === 'Ya') {
                    $mailable = new PermohonanRevisiMail($permohonan);
                } else {
                    $mailable = new PermohonanDitolakMail($permohonan);
                }
            } elseif ($status === 'Revisi') {
                $mailable = new PermohonanRevisiMail($permohonan);
            } elseif ($status === 'Selesai') {
                Log::info('Mengirim email selesai kunjungan', [
                    'id'    => $id,
                    'email' => $email,
                ]);
                $mailable = new KunjunganSelesaiMail($permohonan);
            } elseif ($status === 'Ringkasan_Terkirim') {
                // Status ini ditangani oleh RingkasanService — tidak ada email status tambahan
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);
                Log::info("[EMAIL INFO] Status 'Ringkasan_Terkirim' tidak memerlukan email status. Email ringkasan dikirim oleh RingkasanService.", [
                    'permohonan_id'  => $id,
                    'kode'           => $kode,
                    'execution_time' => "{$executionTime}ms",
                ]);
                return true;
            }

            if (!$mailable) {
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);
                Log::warning("[EMAIL WARNING] Tidak ada template mailable yang sesuai untuk status '{$status}' pada permohonan {$kode}", [
                    'permohonan_id'  => $id,
                    'kode'           => $kode,
                    'status'         => $status,
                    'email'          => $email,
                    'execution_time' => "{$executionTime}ms",
                ]);
                return false;
            }

            $mailableClass = get_class($mailable);
            Log::info("[MAILABLE DIPANGGIL] Menggunakan mailable '{$mailableClass}' untuk permohonan {$kode}");

            // 3. Pengiriman Email Synchronous (send() bukan queue())
            $mailerConfig = config('mail.default', 'smtp');
            Log::info("[SMTP CONNECTING] Mengirim email via transport '{$mailerConfig}' ke {$email}...");

            Mail::to($email)->send($mailable);

            if ($status === 'Selesai') {
                Log::info('Email selesai kunjungan berhasil terkirim', [
                    'id'    => $id,
                    'email' => $email,
                ]);
            }

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::info("[EMAIL BERHASIL] Email berhasil dikirim ke '{$email}' untuk permohonan {$kode} dalam {$executionTime}ms", [
                'permohonan_id'  => $id,
                'kode'           => $kode,
                'status'         => $status,
                'email'          => $email,
                'mailable'       => $mailableClass,
                'execution_time' => "{$executionTime}ms",
            ]);

            return true;

        } catch (Throwable $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            if ($status === 'Selesai') {
                Log::error('Gagal mengirim email selesai kunjungan', [
                    'id'    => $id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
            Log::error("[EMAIL GAGAL] Exception saat mengirim email ke '{$email}' setelah {$executionTime}ms. Error: {$e->getMessage()}", [
                'permohonan_id'   => $id,
                'kode'            => $kode,
                'status'          => $status,
                'email'           => $email,
                'execution_time'  => "{$executionTime}ms",
                'exception_class' => get_class($e),
                'exception_code'  => $e->getCode(),
                'file'            => $e->getFile(),
                'line'            => $e->getLine(),
                'stack_trace'     => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Persiapan Struktur H+3: Pengiriman Ringkasan PDF (Placeholder / Stub untuk pengembangan mendatang)
     */
    public function schedulePdfSummaryNotification(Permohonan $permohonan): void
    {
        Log::info("[NOTIFICATION H+3 PREPARED] Struktur penjadwalan ringkasan PDF H+3 disiapkan untuk permohonan {$permohonan->kode}");
    }
}
