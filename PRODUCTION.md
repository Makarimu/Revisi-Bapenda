# Production Deployment

## Backend

1. Copy `backend/.env.example` to `backend/.env` and set the production domain, database, mail credentials, and `APP_KEY`.
2. Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` to the HTTPS URL, and use a persistent database and public storage volume.
3. Run `backend/deploy.ps1` on Windows, or run the equivalent commands:

```sh
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

4. Configure the web server document root to `backend/public`. Do not expose the repository root, `storage`, `.env`, or `vendor`.
5. Set PHP upload limits to at least `12M` and enable a queue worker if `QUEUE_CONNECTION` is changed from `database`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env.production` and set the API URL.
2. Run `npm ci` followed by `npm run build` in `frontend`.
3. Serve `frontend/dist` as static files and configure SPA fallback to `index.html`.

## Operations

- Schedule `php artisan sanctum:prune-expired --hours=24` daily.
- Retain and monitor `storage/logs`; the production template uses daily rotation for 14 days.
- Run `php artisan test` and `npm run lint && npm run build` before deployment.
