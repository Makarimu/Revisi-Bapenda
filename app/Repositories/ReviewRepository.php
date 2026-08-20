<?php

namespace App\Repositories;

use App\Models\Review;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ReviewRepository implements ReviewRepositoryInterface
{
    public function create(array $data): Review
    {
        return Review::create($data);
    }

    public function findByPermohonanId(int $permohonanId): ?Review
    {
        return Review::where('permohonan_id', $permohonanId)->first();
    }

    public function findById(int $id): ?Review
    {
        return Review::find($id);
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Review::with(['permohonan'])->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('permohonan', function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('instansi', 'like', "%{$search}%")
                  ->orWhere('nama_pic', 'like', "%{$search}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function update(Review $review, array $data): bool
    {
        return $review->update($data);
    }

    public function getApproved(int $limit = 6): Collection
    {
        return Review::approved()
            ->with(['permohonan:id,instansi,nama_pic'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
