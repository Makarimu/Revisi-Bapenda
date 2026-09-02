<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tanda Terima Permohonan Kunjungan Kerja</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #0028B3 0%, #1883FF 100%); padding: 32px 30px; text-align: center;">
                <img src="{{ $message->embed(public_path('image/icon.png')) }}" alt="Kabupaten Bogor" style="height: 52px; width: auto; max-width: 250px; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">Tanda Terima Pengajuan Kunjungan Kerja</h1>
                <p style="color: #E0E7FF; margin: 6px 0 0 0; font-size: 13px;">Pemerintah Kabupaten Bogor</p>
            </td>
        </tr>

        <!-- Body Content -->
        <tr>
            <td style="padding: 36px 32px;">
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong> ({{ $permohonan->jabatan_pic ?? 'PIC' }}),<br>
                    Terima kasih telah mengajukan permohonan kunjungan kerja melalui Sistem Kunjungan Kerja Kabupaten Bogor. Permohonan Anda telah <strong>berhasil kami terima</strong> dan saat ini tercatat dalam antrean verifikasi administrasi.
                </p>

                <!-- Ticket Code Card -->
                <div style="background: #F8FAFC; border: 1.5px dashed #C5DBFF; border-radius: 12px; padding: 22px; margin-bottom: 26px; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 1.5px; text-transform: uppercase;">KODE PELACAKAN PERMOHONAN</p>
                    <p style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #0028B3; letter-spacing: 1.5px; font-family: monospace;">{{ $permohonan->kode }}</p>
                    <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; padding: 4px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">STATUS: MENUNGGU VERIFIKASI (PENDING)</span>
                </div>

                <!-- Rincian Permohonan -->
                <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 26px;">
                    <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #001178; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
                        📋 Rincian Pengajuan Kunjungan
                    </h3>
                    <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13.5px; line-height: 1.6;">
                        <tr>
                            <td width="38%" style="color: #64748B; vertical-align: top;">Instansi Pemohon</td>
                            <td width="4%" style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; font-weight: 600; vertical-align: top;">{{ $permohonan->instansi }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Nomor Surat</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; font-weight: 600; vertical-align: top;">{{ $permohonan->nomor_surat }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Dinas Tujuan</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #0028B3; font-weight: 700; vertical-align: top;">{{ $permohonan->dinas_tujuan ?? $permohonan->dinas?->nama ?? 'Pemerintah Kabupaten Bogor' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Tanggal Kunjungan</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; font-weight: 600; vertical-align: top;">{{ \Carbon\Carbon::parse($permohonan->tanggal_kunjungan)->translatedFormat('l, d F Y') }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Ketua Rombongan</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; vertical-align: top;">{{ $permohonan->nama_ketua_rombongan }} ({{ $permohonan->jabatan_ketua_rombongan ?? '-' }})</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Jumlah Peserta</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; vertical-align: top;">{{ $permohonan->jumlah_peserta }} Orang</td>
                        </tr>
                        <tr>
                            <td style="color: #64748B; vertical-align: top;">Rencana Menginap</td>
                            <td style="color: #64748B; vertical-align: top;">:</td>
                            <td style="color: #1E293B; vertical-align: top;">{{ $permohonan->rencana_menginap === 'Ya' ? 'Ya (Hotel: ' . ($permohonan->nama_hotel ?: '-') . ')' : 'Tidak Menginap' }}</td>
                        </tr>
                    </table>
                </div>

                <!-- Next Steps Info Box -->
                <div style="background-color: #F0F6FF; border-left: 4px solid #0028B3; padding: 16px 18px; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #001178;">ℹ️ Tahap Selanjutnya:</p>
                    <p style="margin: 0; font-size: 12.5px; color: #334155; line-height: 1.5;">
                        Petugas dinas terkait akan melakukan verifikasi berkas dan kesiapan narasumber (estimasi <strong>1–3 hari kerja</strong>). Hasil peninjauan (Persetujuan / Permintaan Revisi) akan dikirimkan otomatis ke alamat email ini.
                    </p>
                </div>

                <!-- CTA Tracking Button -->
                <div style="margin: 30px 0 10px 0; text-align: center;">
                    <a href="{{ rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/') . '/status?kode=' . $permohonan->kode }}" style="display: inline-block; background-color: #0028B3; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,40,179,0.25);">
                        🔍 Cek Status Permohonan
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F8FAFC; padding: 22px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748B;">Sistem Kunjungan Kerja — Pemerintah Kabupaten Bogor</p>
                <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                    Email tanda terima ini dikirim secara otomatis oleh sistem.<br>
                    Harap simpan email ini sebagai bukti pengajuan kunjungan kerja Anda.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
