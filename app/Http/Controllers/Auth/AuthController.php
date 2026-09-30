<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Admin;
use App\Http\Resources\AdminResource;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:100',
            'password' => 'required|string|max:255',
        ]);

        $usernameInput = trim($request->username);
        $cleanSlug = Str::slug($usernameInput, '_');

        $admin = Admin::where('username', $usernameInput)
            ->orWhereRaw('LOWER(username) = ?', [strtolower($usernameInput)])
            ->orWhere('username', 'admin_' . $cleanSlug)
            ->orWhereHas('dinas', function ($q) use ($usernameInput) {
                $q->whereRaw('LOWER(singkatan) = ?', [strtolower($usernameInput)])
                  ->orWhereRaw('LOWER(nama) = ?', [strtolower($usernameInput)]);
            })
            ->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah.'
            ], 401);
        }

        // Izinkan multi-login (tidak menghapus token lama agar akun tidak auto logout di device lain)
        // Token diterbitkan tanpa batas waktu kedaluwarsa (unlimited session)
        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'nama' => $admin->nama, // kolom DB: nama
            'admin' => new AdminResource($admin)
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'admin' => new AdminResource($request->user())
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout'
        ]);
    }
}
