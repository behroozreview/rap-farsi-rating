import Link from "next/link";

import { isAuthConfigured } from "@/lib/auth-config";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getPublicSongStats, listSongYears, listSongs } from "@/lib/songs";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    year?: string;
    rating?: string;
  }>;
};

function getRatingRowClass(rating: number) {
  if (rating >= 8) return "bg-emerald-500/10";
  if (rating >= 6) return "bg-sky-500/10";
  if (rating >= 4) return "bg-amber-500/10";
  if (rating >= 2) return "bg-orange-500/10";
  return "bg-rose-500/10";
}

function getScoreBarClass(rating: number) {
  if (rating >= 8) return "bg-emerald-500";
  if (rating >= 6) return "bg-sky-500";
  if (rating >= 4) return "bg-amber-500";
  if (rating >= 2) return "bg-orange-500";
  return "bg-rose-500";
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const yearParam = params.year?.trim();
  const rating = params.rating ? Number(params.rating) : undefined;
  const authConfigured = isAuthConfigured();

  let songs;
  let years;
  let stats;

  try {
    [years, stats] = await Promise.all([listSongYears(), getPublicSongStats()]);

    const latestYear = years[0];
    const selectedYear = yearParam === "all"
      ? undefined
      : yearParam
        ? Number(yearParam)
        : latestYear;

    songs = await listSongs({ q, year: selectedYear, rating });
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Singles archive is not configured yet"
          description="The public list needs a database connection before it can load your singles ratings."
        />
      );
    }

    throw error;
  }

  const latestYear = years[0];
  const selectedYearValue = yearParam ?? (latestYear ? String(latestYear) : "all");

  return (
    <main className="page-shell flex flex-1 flex-col gap-4 pb-10">
      <header className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/70">RapFarsi Singles Archive</p>
            <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
              Single Ratings (0-9)
            </h1>
          </div>
          <div className="flex gap-2">
            <Link className="pill" href="/admin">
              {authConfigured ? "Admin Panel" : "Admin Setup"}
            </Link>
            {authConfigured ? (
              <Link className="pill" href="/api/auth/signin">
                Admin Sign In
              </Link>
            ) : null}
          </div>
        </div>
        <form className="mt-5 flex flex-wrap gap-2" action="/" method="get">
          <input
            className="pill min-w-60"
            type="search"
            name="q"
            placeholder="Search single title or artist"
            defaultValue={q}
          />
          <select className="pill w-40" name="year" defaultValue={selectedYearValue}>
            <option value="all">All years</option>
            {years.map((itemYear) => (
              <option key={itemYear} value={itemYear}>
                {itemYear}
              </option>
            ))}
          </select>
          <input
            className="pill w-28"
            type="number"
            min={0}
            max={9}
            name="rating"
            placeholder="Rating"
            defaultValue={rating}
          />
          <button className="button button-primary" type="submit">
            Apply
          </button>
          <Link className="button" href="/">
            Reset
          </Link>
        </form>
      </header>

      <section className="card overflow-hidden">
        <div className="border-b border-foreground/10 px-5 py-3">
          <p className="text-sm text-foreground/75">{songs.length} singles found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="bg-[var(--surface-strong)] text-sm uppercase tracking-wide text-foreground/70">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Artist</th>
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr
                  key={song.id}
                  className={`${getRatingRowClass(song.rating)} border-b border-foreground/10 last:border-b-0`}
                >
                  <td className="px-5 py-3">
                    <Link href={`/songs/${song.id}`} className="font-semibold hover:underline">
                      {song.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground/80">{song.artist || "-"}</td>
                  <td className="px-5 py-3">{song.persianYear}</td>
                  <td className="px-5 py-3">{song.rating}/9</td>
                  <td className="px-5 py-3">
                    {song.url ? (
                      <a
                        className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
                        href={song.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Single Link
                      </a>
                    ) : (
                      <span className="text-foreground/60">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card p-5 lg:col-span-1">
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Score Distribution</p>
          <p className="mt-2 text-sm text-foreground/75">How the single scores spread across the archive.</p>
          <div className="mt-4 space-y-3">
            {stats.scoreDistribution.length > 0 ? (
              stats.scoreDistribution.map((item) => {
                const width = stats.totalSongs ? Math.max((item.count / stats.totalSongs) * 100, 4) : 4;

                return (
                  <div key={item.rating}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.rating}/9</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-foreground/10">
                      <div
                        className={`h-2 rounded-full ${getScoreBarClass(item.rating)}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-foreground/65">No singles yet.</p>
            )}
          </div>
        </article>

        <article className="card p-5 lg:col-span-1">
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Singles per Year</p>
          <p className="mt-2 text-sm text-foreground/75">Released singles grouped by Persian year.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.releasesByYear.length > 0 ? (
              stats.releasesByYear.map((item) => (
                <li key={item.year} className="flex items-center justify-between rounded-lg bg-[var(--surface-strong)] px-3 py-2">
                  <span>{item.year}</span>
                  <span>{item.count}</span>
                </li>
              ))
            ) : (
              <li className="text-foreground/65">No singles yet.</li>
            )}
          </ul>
        </article>

        <article className="card p-5 lg:col-span-1">
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Top Artists</p>
          <p className="mt-2 text-sm text-foreground/75">Artists with the most released singles in this archive.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topArtists.length > 0 ? (
              stats.topArtists.map((item) => (
                <li key={item.artist} className="flex items-center justify-between rounded-lg bg-[var(--surface-strong)] px-3 py-2">
                  <span className="truncate pr-3">{item.artist}</span>
                  <span>{item.count}</span>
                </li>
              ))
            ) : (
              <li className="text-foreground/65">No artists yet.</li>
            )}
          </ul>
        </article>
      </section>
    </main>
  );
}
