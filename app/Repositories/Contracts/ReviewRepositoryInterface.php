<?php

namespace App\Repositories\Contracts;

use App\Models\Review;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReviewRepositoryInterface
{
    public function create(array $data): Review;

    public function findByPermohonanId(int $permohonanId): ?Review;

    public function findById(int $id): ?Review;

    public function getAll(array $filters = []): LengthAwarePaginator;

    public function update(Review $review, array $data): bool;

    public function getApproved(int $limit = 6): Collection;
}
