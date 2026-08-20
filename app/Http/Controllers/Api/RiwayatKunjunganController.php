<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RiwayatKunjunganResource;
use App\Services\RiwayatKunjunganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiwayatKunjunganController extends Controller
{
    public function __construct(
        private RiwayatKunjunganService $riwayatService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'rating', 'sort', 'per_page', 'page']);

        $paginator = $this->riwayatService->getRiwayatKunjungan($filters);
        $statistik = $this->riwayatService->getStatistik();

        return response()->json([
            'success'   => true,
            'statistik' => $statistik,
            'data'      => RiwayatKunjunganResource::collection($paginator->items()),
            'meta'      => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ]);
    }
}
