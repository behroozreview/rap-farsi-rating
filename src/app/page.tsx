import Link from "next/link";

import { SongSourceLink } from "@/components/song-source-link";
import { isAuthConfigured } from "@/lib/auth-config";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { listSongYears, listSongs, resolveYearFilter } from "@/lib/songs";
import { getPublicRatingClass } from "@/lib/song-colors";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    year?: string;
    rating?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const yearParam = params.year?.trim();
  const rating = params.rating ? Number(params.rating) : undefined;
  const authConfigured = isAuthConfigured();

  let songs;
  let years;

  try {
    years = await listSongYears();

    const latestYear = years[0];
    const { year: selectedYear } = resolveYearFilter(yearParam, latestYear);

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
  const { value: selectedYearValue } = resolveYearFilter(yearParam, latestYear);

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
            <Link className="pill" href="/stats">
              Statistics
            </Link>
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
                  className={`${getPublicRatingClass(song.rating)} border-b border-foreground/10 last:border-b-0`}
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
                      <SongSourceLink href={song.url} compact />
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
    </main>
  );
}
