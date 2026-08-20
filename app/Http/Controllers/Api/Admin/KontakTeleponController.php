<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TambahKontakTeleponRequest;
use App\Http\Requests\EditKontakTeleponRequest;
use App\Repositories\Contracts\KontakTeleponRepositoryInterface;
use App\Http\Resources\KontakTeleponResource;

class KontakTeleponController extends Controller
{
    public function __construct(
        private KontakTeleponRepositoryInterface $kontakTeleponRepo
    ) {}

    public function index()
    {
        $data = $this->kontakTeleponRepo->getAll();
        return response()->json([
            'success' => true,
            'data' => KontakTeleponResource::collection($data)
        ]);
    }

    public function store(TambahKontakTeleponRequest $request)
    {
        $kontak = $this->kontakTeleponRepo->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil ditambahkan.',
            'data' => new KontakTeleponResource($kontak)
        ], 201);
    }

    public function update(EditKontakTeleponRequest $request, $id)
    {
        $kontak = $this->kontakTeleponRepo->findById($id);
        
        if (!$kontak) {
            return response()->json(['success' => false, 'message' => 'Kontak tidak ditemukan.'], 404);
        }

        $this->kontakTeleponRepo->update($kontak, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil diperbarui.',
            'data' => new KontakTeleponResource($kontak->fresh())
        ]);
    }

    public function toggleStatus($id)
    {
        $kontak = $this->kontakTeleponRepo->findById($id);
        
        if (!$kontak) {
            return response()->json(['success' => false, 'message' => 'Kontak tidak ditemukan.'], 404);
        }

        $newStatus = $kontak->status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        $this->kontakTeleponRepo->update($kontak, ['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => 'Status kontak berhasil diubah menjadi ' . $newStatus . '.',
            'data' => new KontakTeleponResource($kontak->fresh())
        ]);
    }

    public function destroy($id)
    {
        $kontak = $this->kontakTeleponRepo->findById($id);
        
        if (!$kontak) {
            return response()->json(['success' => false, 'message' => 'Kontak tidak ditemukan.'], 404);
        }

        $this->kontakTeleponRepo->delete($kontak);

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil dihapus.'
        ]);
    }
}
