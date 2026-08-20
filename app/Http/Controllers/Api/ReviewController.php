<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
        private PermohonanRepositoryInterface $permohonanRepo,
        private ReviewRepositoryInterface $reviewRepo
    ) {}

    public function submit(SubmitReviewRequest $request, string $kode): JsonResponse
    {
        try {
            $permohonan = $this->permohonanRepo->findByKode(strtoupper($kode));

            if (!$permohonan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan tidak ditemukan.'
                ], 404);
            }

            $review = $this->reviewService->submitReview($permohonan, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Terima kasih atas penilaian Anda.',
                'data'    => new ReviewResource($review->load('permohonan'))
            ], 201);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getApproved(): JsonResponse
    {
        $reviews = $this->reviewRepo->getApproved(6);

        return response()->json([
            'success' => true,
            'data'    => ReviewResource::collection($reviews)
        ]);
    }
}
