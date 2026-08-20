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
            <td style="background: linear-gradient(135deg, #1a5276 0%, #2980b9 100%); padding: 30px; text-align: center;">
                <img src="https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su" alt="Bappenda Juara" style="height: 38px; width: auto; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Ringkasan Hasil Kunjungan Kerja</h1>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br><br>
                    Terima kasih telah melakukan kunjungan kerja ke <strong>Badan Pengelolaan Pendapatan Daerah (Bappenda) Kabupaten Bogor</strong>.
                </p>

                <!-- Kode Permohonan -->
                <div style="background-color: #f8fafc; border-left: 4px solid #1a5276; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">KODE PERMOHONAN</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 800; color: #1a5276; letter-spacing: 1px;">{{ $permohonan->kode }}</p>
                </div>

                <!-- Terima kasih rating -->
                <div style="background-color: #fef9e7; border: 1.5px solid #f0c040; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #92400e;">⭐ Terima Kasih atas Penilaian Anda</p>
                    <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">
                        Kami sangat menghargai rating dan ulasan yang telah Anda berikan. Masukan Anda adalah motivasi kami untuk terus meningkatkan kualitas layanan kunjungan kerja.
                    </p>
                </div>

                <!-- Ringkasan tersedia -->
                <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 18px 20px; border-radius: 8px; margin-bottom: 28px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #166534;">📄 Ringkasan Hasil Kunjungan Tersedia</p>
                    <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.6;">
                        Ringkasan hasil kunjungan kerja Anda telah disusun dan tersedia dalam format PDF. Silakan unduh melalui tombol di bawah ini atau dari lampiran email ini.
                    </p>
                </div>

                <!-- Tombol unduh -->
                <div style="margin: 28px 0; text-align: center;">
                    <a href="{{ url(env('FRONTEND_URL', 'http://localhost:5173') . '/?page=status&kode=' . $permohonan->kode) }}"
                       style="display: inline-block; background-color: #1a5276; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(26,82,118,0.2);">
                        Lihat Status &amp; Unduh Ringkasan
                    </a>
                </div>

                <p style="margin: 20px 0 0 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                    PDF ringkasan juga dilampirkan langsung pada email ini untuk kemudahan akses Anda.<br>
                    Jika Anda memiliki pertanyaan, silakan hubungi kami melalui kontak yang tersedia.
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    Email ini dikirim secara otomatis oleh sistem.<br>
                    Sistem Kunjungan Kerja — Bappenda Kabupaten Bogor<br>
                    Mohon tidak membalas email ini.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
