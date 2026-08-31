<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
            <td style="background-color: #1883FF; padding: 30px; text-align: center;">
                <img src="{{ $message->embed(public_path('image/icon.png')) }}" alt="Kabupaten Bogor" style="height: 54px; width: auto; max-width: 260px; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Ringkasan Hasil Kunjungan Kerja</h1>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br><br>
                    Terima kasih telah melakukan kunjungan kerja ke <strong>Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor</strong>.
                </p>

                <!-- Kode Permohonan -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 24px; margin-bottom: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Kode Permohonan</td>
                            <td style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Tanggal Kunjungan</td>
                        </tr>
                        <tr>
                            <td style="font-size: 18px; font-weight: 700; color: #1883FF; letter-spacing: 1px; padding-top: 4px;">{{ $permohonan->kode }}</td>
                            <td style="font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; padding-top: 4px;">{{ \Carbon\Carbon::parse($permohonan->tanggal_kunjungan)->translatedFormat('d F Y') }}</td>
                        </tr>
                    </table>
                </div>

                <!-- Info Lampiran PDF -->
                <div style="background-color: #eff6ff; border-left: 4px solid #1883FF; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 28px;">
                    <p style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: 700; color: #1883FF;">
                        📎 Dokumen PDF Terlampir
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6;">
                        Dokumen <strong>Ringkasan Hasil Kunjungan Kerja</strong> telah dilampirkan langsung pada email ini dalam format PDF. Anda dapat mengunduh atau mencetaknya sebagai bukti dan dokumentasi resmi.
                    </p>
                </div>

                <p style="margin: 0 0 28px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                    Anda juga dapat melihat riwayat dan memantau status permohonan kapan saja melalui tautan di bawah:
                </p>

                <!-- Tombol CTA -->
                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="{{ rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/') . '/status?kode=' . $permohonan->kode }}"
                       style="display: inline-block; background-color: #1883FF; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 13.5px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(24,131,255,0.25);">
                        Lihat Status &amp; Detail Permohonan
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">
                    Email ini dikirim secara otomatis oleh Sistem Kunjungan Kerja BAPPENDA Kabupaten Bogor.
                </p>
                <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                    Mohon tidak membalas email ini secara langsung.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
