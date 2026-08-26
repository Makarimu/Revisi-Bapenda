<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dinas;

class DinasController extends Controller
{
    // Public endpoint for visitor form dropdown
    public function listPublic()
    {
        $dinas = Dinas::orderBy('nama', 'asc')->get(['id', 'nama', 'singkatan', 'nomor_telepon', 'latitude', 'longitude']);
        return response()->json([
            'success' => true,
            'data' => $dinas
        ]);
    }

    // Admin listing (all attributes)
    public function index()
    {
        $dinas = Dinas::orderBy('nama', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $dinas
        ]);
    }

    // Store new Dinas
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:200',
            'singkatan' => 'required|string|max:50',
            'nomor_telepon' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $dinas = Dinas::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dinas berhasil ditambahkan.',
            'data' => $dinas
        ], 201);
    }

    // Update Dinas
    public function update(Request $request, $id)
    {
        $dinas = Dinas::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:200',
            'singkatan' => 'required|string|max:50',
            'nomor_telepon' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $dinas->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dinas berhasil diperbarui.',
            'data' => $dinas
        ]);
    }

    // Destroy Dinas
    public function destroy($id)
    {
        $dinas = Dinas::findOrFail($id);
        $dinas->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dinas berhasil dihapus.'
        ]);
    }
}
