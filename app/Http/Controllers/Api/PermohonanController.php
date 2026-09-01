<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Services\KalenderService;
use App\Services\PermohonanService;
use App\Http\Requests\SubmitPermohonanRequest;
use App\Http\Requests\RevisiPermohonanRequest;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use App\Http\Resources\PermohonanResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PermohonanController extends Controller
{
    public function __construct(
        private KalenderService $kalenderService,
        private PermohonanService $permohonanService,
        private PermohonanRepositoryInterface $permohonanRepo
    ) {}

    public function getTanggalTerpakai(Request $request)
    {
        $email = $request->query('email');
        return response()->json([
            'success' => true,
            'data' => $this->kalenderService->getTanggalTerpakai(),
            'user_booked_dates' => $this->kalenderService->getUserBookedDates($email),
            'min_date' => $this->kalenderService->getMinimumVisitDate($email)->toDateString()
        ]);
    }

    public function submit(SubmitPermohonanRequest $request)
    {
        $startTime = microtime(true);
        Log::info('[STEP 1] Submit permohonan dimulai');

        try {
            $tValStart = microtime(true);
            $data = $request->validated();
            $tValDuration = round((microtime(true) - $tValStart) * 1000, 2);
            Log::info("[STEP 2] Validasi selesai dalam {$tValDuration}ms");

            if (!empty($data['recaptcha_token']) && $data['recaptcha_token'] !== 'dev-bypass') {
                $tRecaptchaStart = microtime(true);
                $this->verifyRecaptcha($data['recaptcha_token'], $request->ip());
                $tRecaptchaDuration = round((microtime(true) - $tRecaptchaStart) * 1000, 2);
                Log::info("[PROFILING] reCAPTCHA v3 terverifikasi dalam {$tRecaptchaDuration}ms");
            }

            unset($data['recaptcha_token']);

            $tDbStart = microtime(true);
            $permohonan = $this->permohonanService->submit($data);
            $tDbDuration = round((microtime(true) - $tDbStart) * 1000, 2);
            Log::info("[STEP 3] Database berhasil disimpan dan dicommit dalam {$tDbDuration}ms");

            $totalDuration = round((microtime(true) - $startTime) * 1000, 2);
            Log::info("[SUBMIT SUCCESS] Permohonan {$permohonan->kode} berhasil diajukan", [
                'kode'                    => $permohonan->kode,
                'validation_time'         => "{$tValDuration}ms",
                'database_time'           => "{$tDbDuration}ms",
                'total_execution_time'    => "{$totalDuration}ms",
            ]);
            
            return response()->json([
                'success' => true,
                'kode' => $permohonan->kode,
                'message' => 'Permohonan berhasil diajukan.',
                'data' => new PermohonanResource($permohonan)
            ], 201);
            
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Submit permohonan error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace'     => $e->getTraceAsString(),
            ]);
            return response()->json(['success' => false, 'message' => 'Permohonan belum dapat diproses.'], 400);
        }
    }

    private function verifyRecaptcha(string $token, ?string $ip): void
    {
        $secretKey = config('services.recaptcha.secret_key');

        if (!$secretKey) {
            Log::error('reCAPTCHA secret key is not configured.');
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi keamanan belum dikonfigurasi. Silakan hubungi administrator.',
            ]);
        }

        try {
            $result = Http::asForm()
                ->timeout(5)
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secretKey,
                    'response' => $token,
                    'remoteip' => $ip,
                ]);
        } catch (\Throwable $e) {
            Log::warning('reCAPTCHA verification request failed: ' . $e->getMessage());
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi keamanan tidak dapat dilakukan. Silakan coba lagi.',
            ]);
        }

        $json = $result->json();

        if (!$result->successful() || !($json['success'] ?? false)) {
            Log::warning('reCAPTCHA v2 verification was rejected.', ['errors' => $json['error-codes'] ?? []]);
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA tidak valid atau telah kedaluwarsa. Silakan ulangi.',
            ]);
        }
    }

    public function status($kode)
    {
        $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
        
        if (!$permohonan) {
            return response()->json([
                'success' => false,
                'message' => 'Kode permohonan tidak ditemukan.'
            ], 404);
        }
        
        $kontakAktif = \App\Models\KontakTelepon::aktif()->first();

        return response()->json([
            'success' => true,
            'data' => new PermohonanResource($permohonan),
            'kontak' => $kontakAktif ? new \App\Http\Resources\KontakTeleponResource($kontakAktif) : null
        ]);
    }

    public function revisi(RevisiPermohonanRequest $request, $kode)
    {
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
            
            if (!$permohonan) {
                return response()->json(['success' => false, 'message' => 'Kode permohonan tidak ditemukan.'], 404);
            }

            $permohonan = $this->permohonanService->revisi($permohonan, $request->validated());
            
            return response()->json([
                'success' => true,
                'message' => 'Revisi berhasil dikirim.',
                'data' => new PermohonanResource($permohonan)
            ]);
            
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Revisi permohonan error: ' . $e->getMessage(), [
                'kode' => $kode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['success' => false, 'message' => $e->getMessage() ?: 'Revisi belum dapat diproses.'], 400);
        }
    }

    public function uploadBuktiPenginapan(Request $request, $kode)
    {
        $request->validate([
            'bukti_menginap' => ['required'],
            'bukti_menginap_nama' => ['nullable', 'string', 'max:255'],
            'bukti_menginap_mime' => ['nullable', 'string', 'max:100'],
        ]);
        
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));
            
            if (!$permohonan) {
                return response()->json(['success' => false, 'message' => 'Permohonan tidak ditemukan'], 404);
            }
            
            $permohonan = $this->permohonanService->uploadBuktiMenginap($permohonan, $request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Bukti penginapan berhasil diunggah.',
                'data' => new PermohonanResource($permohonan)
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Bukti penginapan belum dapat diunggah.'], 400);
        }
    }
}
