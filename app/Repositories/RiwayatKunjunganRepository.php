<?php

namespace App\Repositories;

use App\Models\Permohonan;
use App\Models\Review;
use App\Repositories\Contracts\RiwayatKunjunganRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class RiwayatKunjunganRepository implements RiwayatKunjunganRepositoryInterface
{
    public function getRiwayatKunjungan(array $filters): LengthAwarePaginator
    {
        $permohonanTable = (new Permohonan)->getTable();

        // Query permohonan status Selesai yang memiliki review
        $query = Permohonan::query()
            ->where('status', 'Selesai')
            ->whereHas('review', function ($q) {
                $q->where('status', 'approved');
            })
            ->with(['review', 'dinas']);

        // Filter pencarian nama instansi
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where('instansi', 'like', "%{$search}%");
        }

        // Filter rating (1-5)
        if (!empty($filters['rating'])) {
            $rating = (int) $filters['rating'];
            if ($rating >= 1 && $rating <= 5) {
                $query->whereHas('review', function ($q) use ($rating) {
                    $q->where('rating', $rating)->where('status', 'approved');
                });
            }
        }

        // Sorting
        $sort = $filters['sort'] ?? 'terbaru';
        if ($sort === 'terlama') {
            $query->orderBy(
                Review::select('created_at')
                    ->whereColumn('permohonan_id', "{$permohonanTable}.id")
                    ->limit(1),
                'asc'
            );
        } elseif ($sort === 'rating_tertinggi') {
            $query->orderBy(
                Review::select('rating')
                    ->whereColumn('permohonan_id', "{$permohonanTable}.id")
                    ->limit(1),
                'desc'
            )->orderBy('created_at', 'desc');
        } else {
            // Default: terbaru
            $query->orderBy(
                Review::select('created_at')
                    ->whereColumn('permohonan_id', "{$permohonanTable}.id")
                    ->limit(1),
                'desc'
            );
        }

        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 9;

        return $query->paginate($perPage);
    }

    public function getStatistik(): array
    {
        $baseQuery = Permohonan::query()
            ->where('status', 'Selesai')
            ->whereHas('review', function ($q) {
                $q->where('status', 'approved');
            });

        $totalSelesai = (clone $baseQuery)->count();

        $avgRating = Review::where('status', 'approved')
            ->whereHas('permohonan', function ($q) {
                $q->where('status', 'Selesai');
            })->avg('rating');

        return [
            'total_selesai'     => $totalSelesai,
            'total_review'      => $totalSelesai,
            'rata_rata_rating' => $avgRating ? round((float) $avgRating, 1) : 0,
        ];
    }
}
