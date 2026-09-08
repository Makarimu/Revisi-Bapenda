<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Admin;
use App\Models\Dinas;

$admins = Admin::with('dinas')->get();

echo "| No | Nama Dinas / Peran | Username | Default Password |\n";
echo "|---|---|---|---|\n";

$i = 1;
foreach ($admins as $admin) {
    $namaDinas = $admin->dinas ? $admin->dinas->nama . ' (' . $admin->dinas->singkatan . ')' : 'Super Admin (Semua Akses)';
    $password = $admin->dinas ? 'pass_' . strtolower(str_replace(['-', ' '], '', $admin->dinas->singkatan)) : 'admin123';
    echo "| {$i} | {$namaDinas} | `{$admin->username}` | `{$password}` |\n";
    $i++;
}
