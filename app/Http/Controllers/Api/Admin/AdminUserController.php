<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Display a listing of all admin accounts.
     */
    public function index()
    {
        $admins = Admin::with('dinas')->orderBy('nama', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $admins
        ]);
    }

    /**
     * Create a new admin account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:100|unique:app_admins,username',
            'nama' => 'required|string|max:150',
            'password' => 'required|string|min:6|max:255',
            'dinas_id' => 'nullable|exists:app_md_dinas,id',
        ]);

        $admin = Admin::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil dibuat.',
            'data' => $admin->load('dinas')
        ], 201);
    }

    /**
     * Update an admin account.
     */
    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('app_admins', 'username')->ignore($admin->id),
            ],
            'nama' => 'required|string|max:150',
            'password' => 'nullable|string|min:6|max:255',
            'dinas_id' => 'nullable|exists:app_md_dinas,id',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $admin->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil diperbarui.',
            'data' => $admin->load('dinas')
        ]);
    }

    /**
     * Delete an admin account.
     */
    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        
        // Prevent deleting yourself
        if (auth()->id() == $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.'
            ], 400);
        }

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil dihapus.'
        ]);
    }
}
