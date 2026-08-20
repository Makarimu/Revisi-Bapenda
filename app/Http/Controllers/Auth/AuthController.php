<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah.'
            ], 401);
        }

        // Keep one active session per admin to reduce exposure from leaked tokens.
        $admin->tokens()->delete();
        $token = $admin->createToken(
            'admin-token',
            ['*'],
            now()->addMinutes((int) config('sanctum.expiration'))
        )->plainTextToken;

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
