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

    public function index(Request $request)
    {
        $dinasId = $request->user()->dinas_id;
        $data = $this->tanggalDiblokirRepo->getAllUpcoming($dinasId);
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
        $data['dinas_id'] = $request->user()->dinas_id;

        $tanggalDiblokir = $this->tanggalDiblokirRepo->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tanggal berhasil diblokir.',
            'data' => new TanggalDiblokirResource($tanggalDiblokir)
        ], 201);
    }

    public function destroy(Request $request, $tanggal)
    {
        $dinasId = $request->user()->dinas_id;
        $success = $this->tanggalDiblokirRepo->deleteByTanggal($tanggal, $dinasId);

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
