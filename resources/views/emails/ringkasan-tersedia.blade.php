<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <tr>
            <td style="background-color: #279447; padding: 30px; text-align: center;">
                <img src="https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su" alt="Bappenda Juara" style="height: 38px; width: auto; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Ringkasan Hasil Kunjungan Kerja Telah Tersedia</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    Yth. Bapak/Ibu <strong>{{ $permohonan->nama_pic }}</strong>,<br><br>
                    Terima kasih atas Rating &amp; Review yang telah Anda berikan.<br>
                    Ringkasan hasil kunjungan kerja sekarang sudah tersedia.<br><br>
                    Silakan membuka halaman Cek Status untuk mengunduh dokumen PDF.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">KODE PERMOHONAN</p>
                    <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #279447; letter-spacing: 1px;">{{ $permohonan->kode }}</p>
                    <a href="{{ url(env('FRONTEND_URL', 'http://localhost:5173') . '/status?kode=' . $permohonan->kode) }}"
                       style="display: inline-block; background-color: #279447; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 13.5px;">
                        Unduh PDF Ringkasan
                    </a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #ffffff; padding: 0 40px 40px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.6;">
                    Email ini dikirim otomatis oleh Sistem Kunjungan Kerja Bappenda Kabupaten Bogor.<br>
                    Mohon tidak membalas email ini.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
