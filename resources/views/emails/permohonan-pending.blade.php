<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <tr>
            <td style="background-color: #0028B3; padding: 30px; text-align: center;">
                <img src="https://iili.io/CbJhe7S.png" alt="Kabupaten Bogor" style="height: 48px; width: auto; max-width: 260px; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Permohonan Kunjungan Kerja Diterima</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br>
                    Permohonan kunjungan kerja Anda telah kami terima dan saat ini sedang dalam proses review oleh admin.
                </p>
                <div style="background-color: #f8fafc; border-left: 4px solid #1883FF; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">KODE PERMOHONAN:</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0028B3; letter-spacing: 1px;">{{ $permohonan->kode }}</p>
                </div>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{{ url(env('FRONTEND_URL', 'http://localhost:5173') . '/status?kode=' . $permohonan->kode) }}" style="display: inline-block; background-color: #0028B3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,40,179,0.2);">Pantau Status Permohonan</a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">Email ini dikirim secara otomatis oleh sistem.<br>Sistem Kunjungan Kerja - Kabupaten Bogor</p>
            </td>
        </tr>
    </table>
</body>
</html>
