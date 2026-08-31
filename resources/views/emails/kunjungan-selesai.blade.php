<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <tr>
            <td style="background-color: #1883FF; padding: 30px; text-align: center;">
                <img src="{{ $message->embed(public_path('image/icon.png')) }}" alt="Kabupaten Bogor" style="height: 54px; width: auto; max-width: 260px; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Kunjungan Kerja Telah Selesai</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 40px 30px;">
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    Yth. Bapak/Ibu <strong>{{ $permohonan->nama_pic }}</strong>,<br><br>
                    Terima kasih telah melakukan kunjungan kerja ke Kabupaten Bogor.<br>
                    Silakan memberikan Rating &amp; Review terhadap pelayanan kami.<br>
                    Masukan Anda sangat membantu peningkatan kualitas pelayanan.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">KODE PERMOHONAN</p>
                    <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #1883FF; letter-spacing: 1px;">{{ $permohonan->kode }}</p>
                    <a href="{{ rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/') . '/status?kode=' . $permohonan->kode }}"
                       style="display: inline-block; background-color: #1883FF; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 12px rgba(24,131,255,0.25);">
                        Berikan Rating &amp; Review
                    </a>
                </div>

                <!-- Informasi Ringkasan PDF sedang diproses -->
                <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 18px 20px; border-radius: 6px; margin-top: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #92400E;">📄 Ringkasan Hasil Kunjungan Kerja</h3>
                    <p style="margin: 0; font-size: 12.5px; color: #78350F; line-height: 1.7;">
                        Ringkasan hasil kunjungan kerja masih dalam proses penyusunan oleh Admin.<br>
                        Anda akan menerima email kembali ketika file PDF sudah tersedia.
                    </p>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #ffffff; padding: 0 40px 40px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.6;">
                    Email ini dikirim otomatis oleh Sistem Kunjungan Kerja Kabupaten Bogor.<br>
                    Mohon tidak membalas email ini.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
