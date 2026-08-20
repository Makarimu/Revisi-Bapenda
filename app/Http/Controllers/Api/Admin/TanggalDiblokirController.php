<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BlokirTanggalRequest;
use App\Repositories\Contracts\TanggalDiblokirRepositoryInterface;
use App\Http\Resources\TanggalDiblokirResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TanggalDiblokirController extends Controller
{
    public function __construct(
        private TanggalDiblokirRepositoryInterface $tanggalDiblokirRepo
    ) {}

    public function index()
    {
        $data = $this->tanggalDiblokirRepo->getAllUpcoming();
        return response()->json([
            'success' => true,
            'data' => TanggalDiblokirResource::collection($data)
        ]);
    }

    public function store(BlokirTanggalRequest $request)
    {
        $data = $request->validated();
        $data['diblokir_oleh'] = $request->user()->nama;
        $data['tgl_diblokir'] = Carbon::now();

        $tanggalDiblokir = $this->tanggalDiblokirRepo->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tanggal berhasil diblokir.',
            'data' => new TanggalDiblokirResource($tanggalDiblokir)
        ], 201);
    }

    public function destroy($tanggal)
    {
        $success = $this->tanggalDiblokirRepo->deleteByTanggal($tanggal);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blokir tanggal berhasil dibuka.'
        ]);
    }
}
