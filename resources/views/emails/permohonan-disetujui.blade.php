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
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Permohonan Kunjungan Kerja Disetujui</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 40px 30px;">
                <p style="margin: 0 0 24px 0; font-size: 13.5px; line-height: 1.6; color: #4b5563;">
                    Yth. <strong>{{ $permohonan->nama_pic }}</strong>,<br><br>
                    Selamat, permohonan kunjungan kerja Anda telah <strong style="color: #0028B3;">disetujui</strong>. Silakan hadir sesuai tanggal dan agenda yang telah diajukan, serta tunjukkan kode permohonan kepada petugas saat tiba.
                </p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">KODE PERMOHONAN</p>
                    <p style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0028B3; letter-spacing: 1px;">{{ $permohonan->kode }}</p>
                    <span style="display: inline-block; background-color: #EFF6FF; color: #0028B3; border: 1px solid #C5DBFF; padding: 5px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1px;">DISETUJUI</span>
                </div>

                <div style="background-color: #f8fafc; padding: 20px 24px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 16px 0; font-size: 12.5px; color: #374151;"><strong>Jam Penerimaan Kunjungan:</strong> {{ $permohonan->jam_penerimaan ? $permohonan->jam_penerimaan . ' WIB' : '-' }}</p>
                    
                    @if(count($kontakAktif) > 0)
                    <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">KONTAK YANG DAPAT DIHUBUNGI</p>
                    @foreach($kontakAktif as $kontak)
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;">{{ $kontak->nomor_telepon }} ({{ $kontak->nama_pic }})</p>
                    @endforeach
                    @endif
                    
                    @if($permohonan->keterangan_admin)
                    <p style="margin: 16px 0 6px 0; font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">CATATAN ADMIN</p>
                    <p style="margin: 0; font-size: 12px; color: #374151;">{{ Str::limit($permohonan->keterangan_admin, 220) }}</p>
                    @endif
                </div>
                
                <div style="text-align: center;">
                    <a href="{{ url(env('FRONTEND_URL', 'http://localhost:5173') . '/status?kode=' . $permohonan->kode) }}" style="display: inline-block; background-color: #0028B3; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 6px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(0,40,179,0.2);">Pantau Status Permohonan</a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #ffffff; padding: 0 40px 40px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.6;">
                    Email ini dikirim otomatis oleh Sistem Kunjungan Kerja Kabupaten Bogor<br>
                    sehubungan dengan permohonan yang Anda ajukan.<br>
                    Mohon tidak membalas email ini
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
