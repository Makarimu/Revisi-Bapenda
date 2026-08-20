<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Permohonan;
use App\Services\KalenderService;
use Carbon\Carbon;

class DoubleBookingTest extends TestCase
{
    use RefreshDatabase;

    protected KalenderService $kalenderService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->kalenderService = app(KalenderService::class);
    }

    private function getPayload(string $email, string $tanggalKunjungan): array
    {
        return [
            'tanggal_kunjungan' => $tanggalKunjungan,
            'nomor_surat' => '001/TEST/2026',
            'instansi' => 'Dinas Test',
            'nama_ketua_rombongan' => 'Ketua Test',
            'jabatan_ketua_rombongan' => 'Jabatan Test',
            'nama_pic' => 'PIC Test',
            'jabatan_pic' => 'Jabatan PIC',
            'no_telp' => '081234567890',
            'email' => $email,
            'tujuan' => 'Maksud dan Tujuan Test Kunjungan Kerja',
            'jumlah_peserta' => 5,
            'rencana_menginap' => 'Tidak',
            'surat_permohonan' => 'data:application/pdf;base64,' . base64_encode('%PDF-1.4 dummy content'),
            'surat_permohonan_nama' => 'surat.pdf',
            'surat_permohonan_mime' => 'application/pdf',
            'daftar_pertanyaan' => 'data:application/pdf;base64,' . base64_encode('%PDF-1.4 dummy content'),
            'daftar_pertanyaan_nama' => 'pertanyaan.pdf',
            'daftar_pertanyaan_mime' => 'application/pdf',
        ];
    }

    /**
     * TEST 1 & TEST 2: Email A belum pernah mengajukan vs Email A sudah mengajukan.
     */
    public function test_email_a_sudah_mengajukan_terdeteksi_di_user_booked_dates()
    {
        $emailA = 'emailA@domain.com';
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        // Sebelum booking: user_booked_dates kosong
        $resBefore = $this->getJson('/api/permohonan/tanggal-terpakai?email=' . urlencode($emailA));
        $resBefore->assertStatus(200);
        $this->assertNotContains($targetDateStr, $resBefore->json('user_booked_dates'));

        // Booking pertama oleh Email A
        Permohonan::factory()->create([
            'email' => $emailA,
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Pending',
        ]);

        // Sesudah booking: user_booked_dates berisi tanggal tersebut
        $resAfter = $this->getJson('/api/permohonan/tanggal-terpakai?email=' . urlencode($emailA));
        $resAfter->assertStatus(200);
        $this->assertContains($targetDateStr, $resAfter->json('user_booked_dates'));
    }

    /**
     * TEST 3: Email B tidak terpengaruh oleh user_booked_dates Email A.
     */
    public function test_email_b_tidak_terpengaruh_user_booked_dates_email_a()
    {
        $emailA = 'emailA@domain.com';
        $emailB = 'emailB@domain.com';
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        Permohonan::factory()->create([
            'email' => $emailA,
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Pending',
        ]);

        $resB = $this->getJson('/api/permohonan/tanggal-terpakai?email=' . urlencode($emailB));
        $resB->assertStatus(200);
        $this->assertNotContains($targetDateStr, $resB->json('user_booked_dates'));
        $this->assertNotContains($targetDateStr, $resB->json('data')); // Kapasitas 1/2 belum penuh
    }

    /**
     * TEST 4: Email A mencoba submit ulang pada tanggal yang sama via API -> ditolak backend.
     */
    public function test_backend_menolak_submit_ganda_email_yang_sama_pada_tanggal_yang_sama()
    {
        $email = 'double@domain.com';
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        // Submit 1 BERHASIL
        $res1 = $this->postJson('/api/permohonan', $this->getPayload($email, $targetDateStr));
        $res1->assertStatus(201);

        // Submit 2 dengan tanggal & email sama -> DITOLAK
        $res2 = $this->postJson('/api/permohonan', $this->getPayload($email, $targetDateStr));
        $res2->assertStatus(422)
             ->assertJsonValidationErrors(['tanggal_kunjungan']);
    }

    /**
     * TEST 5: Tanggal dengan 2 pengajuan dari email berbeda -> terpakai penuh (merah) bagi semua email.
     */
    public function test_tanggal_penuh_dua_pengajuan_terbaca_busy_untuk_semua_email()
    {
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        Permohonan::factory()->create([
            'email' => 'user1@domain.com',
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Pending',
        ]);
        Permohonan::factory()->create([
            'email' => 'user2@domain.com',
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Disetujui',
        ]);

        $res = $this->getJson('/api/permohonan/tanggal-terpakai?email=user3@domain.com');
        $res->assertStatus(200);
        $this->assertContains($targetDateStr, $res->json('data'));
    }

    /**
     * TEST 8: Normalisasi email (case-insensitive & whitespace).
     */
    public function test_normalisasi_email_mencegah_double_booking()
    {
        $emailLower = 'same.user@domain.com';
        $emailUpper = ' SAME.USER@DOMAIN.COM ';
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        Permohonan::factory()->create([
            'email' => $emailLower,
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Pending',
        ]);

        // Request API dengan email uppercase & space -> ditolak duplicate
        $res = $this->postJson('/api/permohonan', $this->getPayload($emailUpper, $targetDateStr));
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['tanggal_kunjungan']);
    }

    /**
     * TEST 9: Status DITOLAK tidak mengunci tanggal.
     */
    public function test_status_ditolak_tidak_mengunci_tanggal()
    {
        $email = 'rejected@domain.com';
        $targetDate = Carbon::today()->addDays(10);
        while ($targetDate->isWeekend()) {
            $targetDate->addDay();
        }
        $targetDateStr = $targetDate->toDateString();

        Permohonan::factory()->create([
            'email' => $email,
            'tanggal_kunjungan' => $targetDateStr,
            'status' => 'Ditolak',
        ]);

        $res = $this->getJson('/api/permohonan/tanggal-terpakai?email=' . urlencode($email));
        $res->assertStatus(200);
        $this->assertNotContains($targetDateStr, $res->json('user_booked_dates'));

        // Bisa mengajukan ulang pada tanggal tersebut
        $resSubmit = $this->postJson('/api/permohonan', $this->getPayload($email, $targetDateStr));
        $resSubmit->assertStatus(201);
    }
}
