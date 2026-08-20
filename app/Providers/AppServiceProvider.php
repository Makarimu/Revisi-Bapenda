<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\PermohonanRepositoryInterface;
use App\Repositories\PermohonanRepository;
use App\Repositories\Contracts\TanggalDiblokirRepositoryInterface;
use App\Repositories\TanggalDiblokirRepository;
use App\Repositories\Contracts\KontakTeleponRepositoryInterface;
use App\Repositories\KontakTeleponRepository;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Repositories\ReviewRepository;
use App\Repositories\Contracts\RiwayatKunjunganRepositoryInterface;
use App\Repositories\RiwayatKunjunganRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PermohonanRepositoryInterface::class, PermohonanRepository::class);
        $this->app->bind(TanggalDiblokirRepositoryInterface::class, TanggalDiblokirRepository::class);
        $this->app->bind(KontakTeleponRepositoryInterface::class, KontakTeleponRepository::class);
        $this->app->bind(ReviewRepositoryInterface::class, ReviewRepository::class);
        $this->app->bind(RiwayatKunjunganRepositoryInterface::class, RiwayatKunjunganRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by(strtolower((string) $request->input('username')).'|'.$request->ip()));
        RateLimiter::for('public-api', fn (Request $request) => Limit::perMinute(30)->by($request->ip()));
        RateLimiter::for('admin-api', fn (Request $request) => Limit::perMinute(120)
            ->by((string) optional($request->user())->getAuthIdentifier() ?: $request->ip()));
    }
}
