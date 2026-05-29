# RapFarsi Rating

Personal song rating website for RapFarsi tracks.

## Features

- Public read-only view with filters by Persian year and rating.
- Admin panel (GitHub login) for:
	- Add songs manually one by one.
	- Edit/Delete existing songs.
	- Bulk import songs from CSV with preview and validation.
- Rating scale is strictly 1-9.

## Data Model

### `songs`

- `title` (required)
- `artist` (optional)
- `url` (required)
- `rating` (integer 1-9)
- `persian_year` (integer)
- `notes` (optional)
- `imported_from` (manual/csv source)
- `created_at`, `updated_at`

### `import_logs`

- `file_name`
- `imported_count`
- `failed_count`
- `errors` (JSON row-level errors)
- `created_at`

### `users`

- `email`
- `role` (`admin` or `viewer`)
- `created_at`

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required:

- `DATABASE_URL`: Postgres URL (Vercel Postgres/Neon)
- `NEXTAUTH_URL`: app URL
- `NEXTAUTH_SECRET`: random secret string
- `GITHUB_ID`: GitHub OAuth app client ID
- `GITHUB_SECRET`: GitHub OAuth app client secret
- `ADMIN_EMAILS`: comma-separated admin GitHub emails

## Local Development

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:3000

## CSV Import Format

Expected columns:

```csv
title,artist,url,rating,persian_year
Track Name,Artist Name,https://example.com,8,1403
```

Rules:

- `rating` must be between 1 and 9.
- `persian_year` must be in valid range.
- `url` must be valid.
- Duplicates are skipped by `title + artist + persian_year`.

## Persistence Suggestions

For your use case (personal app, Vercel free tier):

1. Vercel Postgres (recommended): reliable persistence and easiest production flow.
2. Supabase Postgres: good if you want platform flexibility later.
3. SQLite: avoid on Vercel serverless for production persistence.

Backup recommendation:

- Keep periodic CSV exports or SQL dumps in a private backup location.
- Add a weekly GitHub Action backup if data becomes important.

## Deploy With GitHub Actions + Vercel

Workflow: `.github/workflows/deploy.yml`

Repository secrets required:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are the Vercel identifiers for your project. Add them as GitHub secrets so the workflow can create `.vercel/project.json` during CI.

Vercel project should be created once in the dashboard, then linked to this GitHub repo.

Pipeline behavior:

- Push to `main`: lint + typecheck + build + production deploy.
- Manual runs are available from the GitHub Actions tab via `workflow_dispatch` and trigger a production deploy.
- The workflow uses `npx vercel@latest`, so no global Vercel CLI install is needed on the runner.
- Branch pushes other than `main` only run if you manually dispatch the workflow.

## How To Connect To Vercel Using GitHub Actions

1. Create a Vercel project for this GitHub repository.
2. Copy the project and organization IDs from Vercel settings.
3. Add these GitHub repository secrets:
	- `VERCEL_TOKEN`
	- `VERCEL_ORG_ID`
	- `VERCEL_PROJECT_ID`
4. Add your app environment variables to Vercel and to GitHub Actions if the workflow needs them during build.
5. Push or merge to `main` to trigger the production deployment.
6. Use manual dispatch from the Actions tab if you want to rerun a production deployment without a new commit.

Recommended Vercel project settings:

- Production branch: `main`
- Preview deployments: disabled
- Framework preset: Next.js
- Root directory: repository root

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run lint`: lint
- `npm run typecheck`: TypeScript checks
- `npm run check`: lint + typecheck
- `npm run db:generate`: generate Drizzle migration
- `npm run db:migrate`: apply migrations
