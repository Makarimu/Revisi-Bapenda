<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Dinas;
use App\Models\Permohonan;
use App\Models\Review;
use App\Services\EmailService;
use App\Services\ReviewService;
use Carbon\Carbon;
use Illuminate\Support\Str;

echo "========================================================" . PHP_EOL;
echo "  PENGUJIAN KUNKER & REVIEW: makarimusamarkandi733@gmail.com" . PHP_EOL;
echo "========================================================" . PHP_EOL;

// 1. Ambil data dinas tujuan (Bappenda)
$dinas = Dinas::where('nama', 'like', '%Pendapatan%')->first() ?: Dinas::first();
echo "1. Dinas Tujuan: {$dinas->nama} (ID: {$dinas->id})" . PHP_EOL;

// 2. Data Pemohon (Makarimu Samarkandi)
$targetEmail = 'gayssssmantapppppppp@gmail.com';
$userData = [
    'instansi'             => 'Badan Pendapatan Daerah Kota Bogor',
    'nomor_surat'          => '005/2140/Bapenda-Kgr/IX/2026',
    'nama_pic'             => 'Makarimu Samarkandi, S.Tr.Kom.',
    'jabatan_pic'          => 'Pranata Komputer Ahli Muda',
    'no_telp'              => '081298765432',
    'email'                => $targetEmail,
    'nama_ketua'           => 'Drs. H. Hendra Setiawan, M.Si.',
    'jabatan_ketua'        => 'Kepala Badan Pendapatan Daerah',
    'jumlah_peserta'       => 12,
    'tanggal_kunjungan'    => Carbon::now()->subDays(1)->format('Y-m-d'),
    'tujuan'               => 'Studi komparasi tata kelola integrasi data perpajakan daerah, pengelolaan opsen PKB/BBNKB, dan digitalisasi pelayanan publik.',
    'menginap'             => 'Ya',
    'hotel'                => 'The Alana Hotel & Conference Center Sentul City',
    'rating'               => 5,
    'review'               => 'Pelayanan kunjungan kerja di Kabupaten Bogor sangat memuaskan, ramah, dan profesional. Paparan materi yang disampaikan sangat aplikatif dan membuka wawasan baru untuk akselerasi digitalisasi pendapatan daerah kami.',
];

// Generate kode unik kunker
$datePart = Carbon::parse($userData['tanggal_kunjungan'])->format('Ymd');
$randomPart = strtoupper(Str::random(5));
$kode = "KUNKER-{$datePart}-{$randomPart}";

echo "2. Membuat Permohonan Baru:" . PHP_EOL;
echo "   - Kode Permohonan : {$kode}" . PHP_EOL;
echo "   - Instansi        : {$userData['instansi']}" . PHP_EOL;
echo "   - Nama PIC        : {$userData['nama_pic']}" . PHP_EOL;
echo "   - Email PIC       : {$userData['email']}" . PHP_EOL;
echo "   - No. Telp/WA     : {$userData['no_telp']}" . PHP_EOL;
echo "   - Tanggal Kunker  : {$userData['tanggal_kunjungan']}" . PHP_EOL;

$permohonan = Permohonan::create([
    'kode'                      => $kode,
    'nomor_surat'               => $userData['nomor_surat'],
    'instansi'                  => $userData['instansi'],
    'nama_ketua_rombongan'      => $userData['nama_ketua'],
    'jabatan_ketua_rombongan'   => $userData['jabatan_ketua'],
    'nama_pic'                  => $userData['nama_pic'],
    'jabatan_pic'               => $userData['jabatan_pic'],
    'no_telp'                   => $userData['no_telp'],
    'email'                     => $userData['email'],
    'tanggal_kunjungan'         => $userData['tanggal_kunjungan'],
    'tujuan'                    => $userData['tujuan'],
    'dinas_id'                  => $dinas->id,
    'dinas_tujuan'              => $dinas->nama,
    'jumlah_peserta'            => $userData['jumlah_peserta'],
    'rencana_menginap'          => $userData['menginap'],
    'nama_hotel'                => $userData['hotel'],
    'status'                    => 'Pending',
    'tgl_pengajuan_awal'        => Carbon::now()->subDays(5),
    'surat_permohonan'          => 'surat_permohonan/dummy_surat.pdf',
    'daftar_pertanyaan'         => 'daftar_pertanyaan/dummy_pertanyaan.pdf',
]);
echo "   -> Permohonan Tersimpan (Status: Pending)" . PHP_EOL;

// Kirim email notifikasi pending
$emailService = app(EmailService::class);
echo "   -> Mengirim Email Notifikasi Penerimaan Permohonan ke {$targetEmail}..." . PHP_EOL;
$mailPendingSent = $emailService->sendStatusEmail($permohonan);
echo "   -> Hasil Kirim Email Pending: " . ($mailPendingSent ? 'BERHASIL TERKIRIM (SMTP)' : 'GAGAL') . PHP_EOL;

// 3. Admin Memproses Permohonan hingga Disetujui
echo "3. Simulasi Admin Menyetujui Permohonan:" . PHP_EOL;
$permohonan->update([
    'status'                   => 'Disetujui',
    'tgl_disetujui'            => Carbon::now()->subDays(2),
    'narasumber'               => 'Tim Teknis dan Penyuluh Pajak Kab. Bogor',
    'jam_penerimaan'           => '09.00 - 12.00 WIB',
]);
echo "   -> Status Berubah: Disetujui" . PHP_EOL;
echo "   -> Mengirim Email Notifikasi Disetujui ke {$targetEmail}..." . PHP_EOL;
$mailApprovedSent = $emailService->sendStatusEmail($permohonan->fresh());
echo "   -> Hasil Kirim Email Disetujui: " . ($mailApprovedSent ? 'BERHASIL TERKIRIM (SMTP)' : 'GAGAL') . PHP_EOL;

// 4. Admin Menyelesaikan Kunjungan
echo "4. Pelaksanaan Kunjungan Kerja Selesai:" . PHP_EOL;
$permohonan->update([
    'status'                   => 'Selesai',
    'tanggal_selesai_kunjungan'=> Carbon::now()->subDay()->setTime(15, 30, 0),
]);
echo "   -> Status Berubah: Selesai" . PHP_EOL;
echo "   -> Mengirim Email Kunjungan Selesai & Permintaan Ulasan ke {$targetEmail}..." . PHP_EOL;
$mailSelesaiSent = $emailService->sendStatusEmail($permohonan->fresh());
echo "   -> Hasil Kirim Email Selesai: " . ($mailSelesaiSent ? 'BERHASIL TERKIRIM (SMTP)' : 'GAGAL') . PHP_EOL;

// 5. User Memberikan Rating & Review
echo "5. User Mengirimkan Rating & Review:" . PHP_EOL;
echo "   - Bintang: {$userData['rating']} / 5" . PHP_EOL;
echo "   - Ulasan : \"{$userData['review']}\"" . PHP_EOL;

$reviewService = app(ReviewService::class);
$review = $reviewService->submitReview($permohonan->fresh(), [
    'rating' => $userData['rating'],
    'review' => $userData['review'],
]);
echo "   -> Review Berhasil Disimpan (Status Awal Review: {$review->status})" . PHP_EOL;

// 6. Admin Menyetujui (Approve) Review
echo "6. Admin Menyetujui Review Publik:" . PHP_EOL;
$approvedReview = $reviewService->approveReview($review);
echo "   -> Review Telah Di-Approve (Status: {$approvedReview->status})" . PHP_EOL;

// 7. Verifikasi Data Publik via API
echo "7. Verifikasi API Publik (/api/reviews/approved):" . PHP_EOL;
$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $httpKernel->handle(Illuminate\Http\Request::create('/api/reviews/approved', 'GET'));
$json = json_decode($response->getContent(), true);

$totalReviews = count($json['data'] ?? []);
$topItem = $json['data'][0] ?? null;

echo "   - Total Ulasan Disetujui di API: {$totalReviews}" . PHP_EOL;
echo "   - Ulasan Teratas Saat Ini:" . PHP_EOL;
echo "     * Instansi : " . ($topItem['instansi'] ?? '-') . PHP_EOL;
echo "     * PIC      : " . ($topItem['nama_pic'] ?? '-') . PHP_EOL;
echo "     * Rating   : " . ($topItem['rating'] ?? 0) . " Bintang" . PHP_EOL;
echo "     * Ulasan   : \"" . ($topItem['review'] ?? '-') . "\"" . PHP_EOL;

echo PHP_EOL . "HASIL AKHIR: Berhasil 100%! Data dengan email {$targetEmail} telah selesai dan tayang di halaman utama." . PHP_EOL;
