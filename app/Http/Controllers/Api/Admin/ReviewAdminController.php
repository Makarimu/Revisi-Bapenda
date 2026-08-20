<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProsesReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewAdminController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
        private ReviewRepositoryInterface $reviewRepo
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['status', 'search', 'per_page']);
        $reviews = $this->reviewRepo->getAll($filters);

        return ReviewResource::collection($reviews);
    }

    public function proses(ProsesReviewRequest $request, int $id): JsonResponse
    {
        try {
            $review = $this->reviewRepo->findById($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review tidak ditemukan.'
                ], 404);
            }

            $aksi = $request->validated()['aksi'];

            if ($aksi === 'approve') {
                $review = $this->reviewService->approveReview($review);
                $message = 'Review berhasil disetujui.';
            } else {
                $review = $this->reviewService->rejectReview($review);
                $message = 'Review berhasil ditolak.';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data'    => new ReviewResource($review->load('permohonan'))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
