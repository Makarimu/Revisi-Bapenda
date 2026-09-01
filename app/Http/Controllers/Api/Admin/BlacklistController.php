<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blacklist;
use App\Http\Requests\StoreBlacklistRequest;
use App\Http\Requests\UpdateBlacklistRequest;
use Illuminate\Http\Request;

class BlacklistController extends Controller
{
    public function index(Request $request)
    {
        $query = Blacklist::query()->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = strtolower(trim($request->search));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nilai) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(alasan) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $blacklists = $query->get();

        return response()->json([
            'success' => true,
            'data' => $blacklists,
            'stats' => [
                'total' => Blacklist::count(),
                'email' => Blacklist::where('tipe', 'email')->count(),
                'instansi' => Blacklist::where('tipe', 'instansi')->count(),
                'aktif' => Blacklist::where('status', 'aktif')->count(),
            ]
        ]);
    }

    public function store(StoreBlacklistRequest $request)
    {
        $data = $request->validated();
        $admin = $request->user();
        $data['created_by'] = $admin ? ($admin->nama ?? $admin->name ?? 'Admin') : 'Admin';
        
        if (empty($data['status'])) {
            $data['status'] = 'aktif';
        }

        // Cek duplikasi nilai dan tipe
        $exists = Blacklist::where('tipe', $data['tipe'])
            ->whereRaw('LOWER(TRIM(nilai)) = ?', [strtolower(trim($data['nilai']))])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => ucfirst($data['tipe']) . ' tersebut sudah ada di daftar pencegahan (blacklist).'
            ], 422);
        }

        $blacklist = Blacklist::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Data pencegahan berhasil ditambahkan.',
            'data' => $blacklist
        ], 201);
    }

    public function update(UpdateBlacklistRequest $request, $id)
    {
        $blacklist = Blacklist::find($id);

        if (!$blacklist) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        $data = $request->validated();

        if (isset($data['nilai']) && isset($data['tipe'])) {
            $exists = Blacklist::where('tipe', $data['tipe'])
                ->whereRaw('LOWER(TRIM(nilai)) = ?', [strtolower(trim($data['nilai']))])
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => ucfirst($data['tipe']) . ' tersebut sudah ada di data lain.'
                ], 422);
            }
        }

        $blacklist->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data pencegahan berhasil diperbarui.',
            'data' => $blacklist
        ]);
    }

    public function toggleStatus($id)
    {
        $blacklist = Blacklist::find($id);

        if (!$blacklist) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        $blacklist->status = $blacklist->status === 'aktif' ? 'nonaktif' : 'aktif';
        $blacklist->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pencegahan berhasil diubah.',
            'data' => $blacklist
        ]);
    }

    public function destroy($id)
    {
        $blacklist = Blacklist::find($id);

        if (!$blacklist) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        $blacklist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pencegahan berhasil dihapus.'
        ]);
    }
}
