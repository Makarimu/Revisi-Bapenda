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
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Revisi Diterima</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br>
                    Revisi untuk permohonan kunjungan kerja Anda dengan kode <strong style="color: #1883FF;">{{ $permohonan->kode }}</strong> telah kami terima dan akan direview kembali oleh admin.
                </p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{{ rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:5173')), '/') . '/status?kode=' . $permohonan->kode }}" style="display: inline-block; background-color: #1883FF; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(24,131,255,0.25);">Pantau Status Permohonan</a>
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
