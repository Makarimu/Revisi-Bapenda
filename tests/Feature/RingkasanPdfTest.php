<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Admin;
use App\Models\Permohonan;
use App\Models\Review;
use App\Services\RingkasanService;
use App\Mail\RingkasanPdfMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class RingkasanPdfTest extends TestCase
{
    use RefreshDatabase;

    protected Admin $admin;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Mail::fake();

        $this->admin = Admin::factory()->create([
            'username' => 'admin_ringkasan',
            'password' => bcrypt('password123'),
            'nama'     => 'Admin Ringkasan',
        ]);

        $loginRes    = $this->postJson('/api/auth/login', [
            'username' => 'admin_ringkasan',
            'password' => 'password123',
        ]);
        $this->token = $loginRes->json('token');
    }

    // ─────────────────────────────────────────
    // Helper untuk membuat permohonan Selesai
    // ─────────────────────────────────────────

    private function buatPermohonanSelesai(array $override = []): Permohonan
    {
        return Permohonan::factory()->create(array_merge([
            'status'                    => 'Selesai',
            'email'                     => 'pemohon@gmail.com',
            'tanggal_selesai_kunjungan' => Carbon::now(),
        ], $override));
    }

    private function buatPdfFake(): UploadedFile
    {
        return UploadedFile::fake()->create('ringkasan.pdf', 500, 'application/pdf');
    }

    // ─────────────────────────────────────────
    // Test 1: Upload PDF berhasil
    // ─────────────────────────────────────────

    public function test_01_upload_pdf_berhasil(): void
    {
        $permohonan = $this->buatPermohonanSelesai();

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->post("/api/admin/permohonan/{$permohonan->kode}/ringkasan/upload", [
                'ringkasan_pdf' => $this->buatPdfFake(),
            ]);

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'PDF ringkasan berhasil diunggah.');

        $permohonan->refresh();
        $this->assertNotNull($permohonan->ringkasan_pdf_path);
        $this->assertNotNull($permohonan->ringkasan_uploaded_at);
        Storage::disk('public')->assertExists($permohonan->ringkasan_pdf_path);
    }

    // ─────────────────────────────────────────
    // Test 2: Upload gagal — bukan PDF
    // ─────────────────────────────────────────

    public function test_02_upload_gagal_bukan_pdf(): void
    {
        $permohonan = $this->buatPermohonanSelesai();

        $fileBukan = UploadedFile::fake()->create('dokumen.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->post("/api/admin/permohonan/{$permohonan->kode}/ringkasan/upload", [
                'ringkasan_pdf' => $fileBukan,
            ]);

        $res->assertStatus(422);

        $permohonan->refresh();
        $this->assertNull($permohonan->ringkasan_pdf_path);
    }

    // ─────────────────────────────────────────
    // Test 3: Kirim — status bukan Selesai
    // ─────────────────────────────────────────

    public function test_03_kirim_gagal_status_bukan_selesai(): void
    {
        $permohonan = Permohonan::factory()->create([
            'status'                    => 'Disetujui',
            'email'                     => 'pemohon@gmail.com',
            'tanggal_selesai_kunjungan' => Carbon::now(),
            'ringkasan_pdf_path'        => 'ringkasan/test.pdf',
        ]);

        Review::create([
            'permohonan_id' => $permohonan->id,
            'rating'        => 5,
            'review'        => 'Sangat baik',
            'status'        => 'pending',
        ]);

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/admin/permohonan/{$permohonan->kode}/ringkasan/kirim");

        $res->assertStatus(422);
        $this->assertStringContainsString('Selesai', $res->json('message'));
        Mail::assertNothingSent();
    }

    // ─────────────────────────────────────────
    // Test 4: Kirim — status Selesai tapi belum ada review
    // ─────────────────────────────────────────

    public function test_04_kirim_gagal_belum_ada_review(): void
    {
        $permohonan = $this->buatPermohonanSelesai([
            'ringkasan_pdf_path' => 'ringkasan/test.pdf',
        ]);
        // Tidak buat review

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/admin/permohonan/{$permohonan->kode}/ringkasan/kirim");

        $res->assertStatus(422);
        $this->assertStringContainsString('Rating', $res->json('message'));
        Mail::assertNothingSent();
    }

    // ─────────────────────────────────────────
    // Test 5: Kirim — ada review tapi PDF belum upload
    // ─────────────────────────────────────────

    public function test_05_kirim_gagal_pdf_belum_diupload(): void
    {
        $permohonan = $this->buatPermohonanSelesai();

        Review::create([
            'permohonan_id' => $permohonan->id,
            'rating'        => 4,
            'review'        => 'Baik',
            'status'        => 'pending',
        ]);
        // ringkasan_pdf_path = null (belum upload)

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/admin/permohonan/{$permohonan->kode}/ringkasan/kirim");

        $res->assertStatus(422);
        $this->assertStringContainsString('PDF', $res->json('message'));
        Mail::assertNothingSent();
    }

    // ─────────────────────────────────────────
    // Test 6: Semua syarat terpenuhi — email berhasil dikirim
    // ─────────────────────────────────────────

    public function test_06_kirim_berhasil_semua_syarat_terpenuhi(): void
    {
        $permohonan = $this->buatPermohonanSelesai();

        // Upload PDF dulu
        Storage::disk('public')->put('ringkasan/test-ringkasan.pdf', '%PDF-1.4 fake content');
        $permohonan->ringkasan_pdf_path   = 'ringkasan/test-ringkasan.pdf';
        $permohonan->ringkasan_uploaded_at = Carbon::now();
        $permohonan->save();

        // Buat review
        Review::create([
            'permohonan_id' => $permohonan->id,
            'rating'        => 5,
            'review'        => 'Sangat memuaskan',
            'status'        => 'pending',
        ]);

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/admin/permohonan/{$permohonan->kode}/ringkasan/kirim");

        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verifikasi email terkirim dengan mailable yang benar
        Mail::assertSent(RingkasanPdfMail::class, function ($mail) use ($permohonan) {
            return $mail->hasTo($permohonan->email)
                && $mail->permohonan->kode === $permohonan->kode;
        });

        // Verifikasi status berubah ke Ringkasan_Terkirim
        $permohonan->refresh();
        $this->assertEquals('Ringkasan_Terkirim', $permohonan->status);
        $this->assertNotNull($permohonan->ringkasan_sent_at);
        $this->assertEquals('Admin Ringkasan', $permohonan->ringkasan_sent_by);
    }

    // ─────────────────────────────────────────
    // Test 7: Lewat 3 hari — kirim ditolak
    // ─────────────────────────────────────────

    public function test_07_kirim_gagal_lewat_3_hari(): void
    {
        // tanggal_selesai = 4 hari lalu (melewati batas)
        $permohonan = $this->buatPermohonanSelesai([
            'tanggal_selesai_kunjungan' => Carbon::now()->subDays(4),
            'ringkasan_pdf_path'        => 'ringkasan/test.pdf',
        ]);

        Storage::disk('public')->put('ringkasan/test.pdf', '%PDF-1.4 fake');

        Review::create([
            'permohonan_id' => $permohonan->id,
            'rating'        => 3,
            'review'        => 'Cukup',
            'status'        => 'pending',
        ]);

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->postJson("/api/admin/permohonan/{$permohonan->kode}/ringkasan/kirim");

        $res->assertStatus(422);
        $this->assertStringContainsString('3 hari', $res->json('message'));
        Mail::assertNothingSent();

        // Status tidak berubah
        $permohonan->refresh();
        $this->assertEquals('Selesai', $permohonan->status);
        $this->assertNull($permohonan->ringkasan_sent_at);
    }

    // ─────────────────────────────────────────
    // Test 8: Endpoint expiring — return list
    // ─────────────────────────────────────────

    public function test_08_expiring_endpoint_mengembalikan_list(): void
    {
        // Permohonan yang selesai tepat 3 hari lalu (batas hari ini)
        Permohonan::factory()->create([
            'status'                    => 'Selesai',
            'email'                     => 'expiring@gmail.com',
            'tanggal_selesai_kunjungan' => Carbon::now()->subDays(3)->startOfDay(),
            'ringkasan_pdf_path'        => 'ringkasan/expiring.pdf',
            'ringkasan_sent_at'         => null,
        ]);

        $res = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
            ->getJson('/api/admin/ringkasan/expiring');

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'message', 'data']);
    }
}
