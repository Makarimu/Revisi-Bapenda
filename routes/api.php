<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\PermohonanController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\PermohonanAdminController;
use App\Http\Controllers\Api\Admin\TanggalDiblokirController;
use App\Http\Controllers\Api\Admin\KontakTeleponController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RiwayatKunjunganController;
use App\Http\Controllers\Api\HasilKunjunganController;
use App\Http\Controllers\Api\Admin\ReviewAdminController;
use App\Http\Controllers\Api\Admin\RingkasanController;
use App\Http\Controllers\Api\Admin\DinasController;
use App\Http\Controllers\Api\Admin\AdminUserController;

// Auth Routes
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Public Routes (Permohonan & Review)
Route::middleware('throttle:public-api')->group(function () {
    Route::get('/dinas', [DinasController::class, 'listPublic']);
    Route::get('/permohonan/tanggal-terpakai', [PermohonanController::class, 'getTanggalTerpakai']);
    Route::post('/permohonan', [PermohonanController::class, 'submit']);
    Route::get('/permohonan/{kode}', [PermohonanController::class, 'status']);
    Route::post('/permohonan/{kode}/revisi', [PermohonanController::class, 'revisi']);
    Route::post('/permohonan/{kode}/bukti-penginapan', [PermohonanController::class, 'uploadBuktiPenginapan']);
    Route::post('/permohonan/{kode}/review', [ReviewController::class, 'submit']);
    Route::get('/reviews/approved', [ReviewController::class, 'getApproved']);
    Route::get('/riwayat-kunjungan', [RiwayatKunjunganController::class, 'index']);

    // Ringkasan PDF Public Status & Download
    Route::get('/permohonan/{kode}/pdf-status', [HasilKunjunganController::class, 'pdfStatus']);
    Route::get('/permohonan/{kode}/download-pdf', [HasilKunjunganController::class, 'downloadPdf']);
});

// Protected Admin Routes
Route::middleware(['auth:sanctum', 'throttle:admin-api'])->group(function () {
    // Auth Check & Logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin Dashboard
    Route::get('/admin/dashboard/statistik', [DashboardController::class, 'statistik']);
    Route::get('/admin/dashboard/permohonan-hari-ini', [DashboardController::class, 'permohonanHariIni']);
    Route::get('/admin/dashboard/grafik-bulanan', [DashboardController::class, 'grafikBulanan']);
    Route::get('/admin/dashboard/aktivitas-terbaru', [DashboardController::class, 'aktivitasTerbaru']);

    // Admin Permohonan
    Route::get('/admin/permohonan', [PermohonanAdminController::class, 'index']);
    Route::post('/admin/permohonan/export', [PermohonanAdminController::class, 'export']);
    Route::get('/admin/permohonan/{kode}', [PermohonanAdminController::class, 'show']);
    Route::post('/admin/permohonan/{kode}/proses', [PermohonanAdminController::class, 'proses']);
    Route::put('/admin/permohonan/{kode}/proses', [PermohonanAdminController::class, 'proses']);
    Route::post('/admin/permohonan/{kode}/selesai', [PermohonanAdminController::class, 'selesaikan']);
    Route::put('/admin/permohonan/{kode}', [PermohonanAdminController::class, 'update']);
    Route::delete('/admin/permohonan/{kode}', [PermohonanAdminController::class, 'destroy']);

    // Admin Tanggal Diblokir
    Route::get('/admin/tanggal-diblokir', [TanggalDiblokirController::class, 'index']);
    Route::post('/admin/tanggal-diblokir', [TanggalDiblokirController::class, 'store']);
    Route::delete('/admin/tanggal-diblokir/{tanggal}', [TanggalDiblokirController::class, 'destroy']);

    // Admin Kontak Telepon
    Route::get('/admin/kontak-telepon', [KontakTeleponController::class, 'index']);
    Route::post('/admin/kontak-telepon', [KontakTeleponController::class, 'store']);
    Route::put('/admin/kontak-telepon/{id}', [KontakTeleponController::class, 'update']);
    Route::patch('/admin/kontak-telepon/{id}/toggle-status', [KontakTeleponController::class, 'toggleStatus']);
    Route::delete('/admin/kontak-telepon/{id}', [KontakTeleponController::class, 'destroy']);

    // Admin Review
    Route::get('/admin/reviews', [ReviewAdminController::class, 'index']);
    Route::post('/admin/reviews/{id}/proses', [ReviewAdminController::class, 'proses']);

    // Admin Ringkasan PDF
    Route::post('/admin/permohonan/{id}/upload-pdf', [HasilKunjunganController::class, 'upload']);
    Route::delete('/admin/permohonan/{id}/delete-pdf', [HasilKunjunganController::class, 'destroy']);
    Route::post('/admin/permohonan/{kode}/ringkasan/upload', [RingkasanController::class, 'upload']);
    Route::post('/admin/permohonan/{kode}/ringkasan/kirim', [RingkasanController::class, 'kirim']);
    Route::get('/admin/ringkasan/expiring', [RingkasanController::class, 'expiring']);

    // Admin Dinas CRUD
    Route::get('/admin/dinas', [DinasController::class, 'index']);
    Route::post('/admin/dinas', [DinasController::class, 'store']);
    Route::put('/admin/dinas/{id}', [DinasController::class, 'update']);
    Route::delete('/admin/dinas/{id}', [DinasController::class, 'destroy']);

    // Admin User CRUD
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    // Admin Blacklist CRUD
    Route::get('/admin/blacklist', [\App\Http\Controllers\Api\Admin\BlacklistController::class, 'index']);
    Route::post('/admin/blacklist', [\App\Http\Controllers\Api\Admin\BlacklistController::class, 'store']);
    Route::put('/admin/blacklist/{id}', [\App\Http\Controllers\Api\Admin\BlacklistController::class, 'update']);
    Route::patch('/admin/blacklist/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\BlacklistController::class, 'toggleStatus']);
    Route::delete('/admin/blacklist/{id}', [\App\Http\Controllers\Api\Admin\BlacklistController::class, 'destroy']);
});
