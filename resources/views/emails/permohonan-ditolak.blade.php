<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <tr>
            <td style="background: linear-gradient(135deg, #922b21 0%, #c0392b 100%); padding: 30px; text-align: center;">
                <img src="https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su" alt="Bappenda Juara" style="height: 38px; width: auto; margin-bottom: 12px; display: inline-block;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Permohonan Ditolak</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br>
                    Mohon maaf, permohonan kunjungan kerja Anda dengan kode <strong>{{ $permohonan->kode }}</strong> telah <span style="color: #922b21; font-weight: 600;">DITOLAK</span> oleh admin.
                </p>
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #991b1b;"><strong>ALASAN PENOLAKAN:</strong></p>
                    <p style="margin: 0; font-size: 14px; color: #991b1b;">{{ Str::limit($permohonan->keterangan_admin, 220) }}</p>
                </div>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{{ url(env('FRONTEND_URL', 'http://localhost:5173') . '/?page=status&kode=' . $permohonan->kode) }}" style="display: inline-block; background-color: #922b21; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(146,43,33,0.2);">Lihat Selengkapnya</a>
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
