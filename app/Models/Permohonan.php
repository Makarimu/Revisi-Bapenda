<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Permohonan extends Model
{
    use HasFactory;
    protected $table = 'permohonan';

    protected $fillable = [
        'kode',
        'nomor_surat',
        'instansi',
        'nama_ketua_rombongan',
        'jabatan_ketua_rombongan',
        'nama_pic',
        'jabatan_pic',
        'no_telp',
        'email',
        'tanggal_kunjungan',
        'tujuan',
        'jumlah_peserta',
        'rencana_menginap',
        'nama_hotel',
        'surat_permohonan',
        'daftar_pertanyaan',
        'bukti_menginap',
        'status',
        'keterangan_admin',
        'bisa_direvisi',
        'narasumber',
        'jam_penerimaan',
        'tgl_pengajuan_awal',
        'tgl_diproses',
        'tgl_revisi',
        'tgl_disetujui',
        // Kolom ringkasan PDF
        'tanggal_selesai_kunjungan',
        'ringkasan_pdf_path',
        'ringkasan_uploaded_at',
        'ringkasan_sent_at',
        'ringkasan_sent_by',
        'hasil_kunjungan_pdf',
        'hasil_kunjungan_uploaded_at',
        'hasil_kunjungan_uploaded_by',
    ];

    protected $casts = [
        'tanggal_kunjungan'          => 'date',
        'jumlah_peserta'             => 'integer',
        'tgl_pengajuan_awal'         => 'datetime',
        'tgl_diproses'               => 'datetime',
        'tgl_revisi'                 => 'datetime',
        'tgl_disetujui'              => 'datetime',
        'tanggal_selesai_kunjungan'  => 'datetime',
        'ringkasan_uploaded_at'      => 'datetime',
        'ringkasan_sent_at'          => 'datetime',
        'hasil_kunjungan_uploaded_at' => 'datetime',
    ];

    // ──────────────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────────────

    public function statusLogs(): HasMany
    {
        return $this->hasMany(PermohonanStatusLog::class, 'permohonan_id', 'id')->orderBy('created_at', 'desc');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'permohonan_id', 'id');
    }

    // ──────────────────────────────────────────────────
    // Accessors & Mutators
    // ──────────────────────────────────────────────────

    protected function noTelp(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => preg_replace('/[^0-9]/', '', $value),
        );
    }

    protected function linkSurat1(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->surat_permohonan ? url(Storage::url($this->surat_permohonan)) : null,
        );
    }

    protected function linkSurat2(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->daftar_pertanyaan ? url(Storage::url($this->daftar_pertanyaan)) : null,
        );
    }

    protected function linkBuktiMenginap(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->bukti_menginap ? url(Storage::url($this->bukti_menginap)) : null,
        );
    }

    /**
     * URL publik untuk download PDF ringkasan.
     */
    protected function linkRingkasanPdf(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getPdfPath() ? url(Storage::url($this->getPdfPath())) : null,
        );
    }

    public function getPdfPath(): ?string
    {
        return $this->hasil_kunjungan_pdf ?: $this->ringkasan_pdf_path;
    }

    public function getPdfUploadedAt(): ?Carbon
    {
        return $this->hasil_kunjungan_uploaded_at ?: $this->ringkasan_uploaded_at;
    }

    public function getPdfFileSizeFormatted(): ?string
    {
        $path = $this->getPdfPath();
        if (!$path || !Storage::disk('public')->exists($path)) {
            return null;
        }
        $bytes = Storage::disk('public')->size($path);
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        return number_format($bytes / 1024, 2) . ' KB';
    }

    public function getPdfFileName(): ?string
    {
        $path = $this->getPdfPath();
        if (!$path) return null;
        return basename($path);
    }

    // ──────────────────────────────────────────────────
    // Helper Methods (Ringkasan)
    // ──────────────────────────────────────────────────

    /**
     * Batas maksimal pengiriman ringkasan: tanggal_selesai + 3 hari.
     */
    public function batasKirimRingkasan(): ?Carbon
    {
        if (!$this->tanggal_selesai_kunjungan) {
            return null;
        }
        return Carbon::parse($this->tanggal_selesai_kunjungan)->endOfDay()->addDays(3);
    }

    /**
     * Apakah ringkasan masih boleh dikirim (belum melewati batas 3 hari).
     */
    public function isBelumMelampauiBatas(): bool
    {
        $batas = $this->batasKirimRingkasan();
        return $batas && now()->lte($batas);
    }

    /**
     * Validasi penuh apakah tombol "Kirim Ringkasan" boleh aktif.
     * Syarat: Status Selesai, ada review, ada PDF, belum melewati batas 3 hari.
     */
    public function isRingkasanBisaDikirim(): bool
    {
        return $this->status === 'Selesai'
            && $this->relationLoaded('review') ? $this->review !== null : $this->review()->exists()
            && !empty($this->ringkasan_pdf_path)
            && $this->isBelumMelampauiBatas();
    }

    // ──────────────────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeDisetujui($query)
    {
        return $query->where('status', 'Disetujui');
    }

    public function scopeDitolak($query)
    {
        return $query->where('status', 'Ditolak');
    }

    public function scopeRevisi($query)
    {
        return $query->where('status', 'Revisi');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['Pending', 'Disetujui', 'Revisi']);
    }

    public function scopeSelesai($query)
    {
        return $query->where('status', 'Selesai');
    }

    /**
     * Permohonan dengan status Selesai yang batas pengiriman ringkasan = hari ini
     * (tanggal_selesai_kunjungan + 3 hari = today) dan ringkasan belum dikirim.
     */
    public function scopeRingkasanExpiresToday($query)
    {
        $today = now()->toDateString();
        return $query->where('status', 'Selesai')
            ->whereNotNull('ringkasan_pdf_path')
            ->whereNull('ringkasan_sent_at')
            ->whereDate('tanggal_selesai_kunjungan', now()->subDays(3)->toDateString());
    }
}
