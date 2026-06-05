import Link from "next/link";

import { PublicSongFilters } from "@/components/public-song-filters";
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
  const defaultYearValue = latestYear ? String(latestYear) : "all";
  const averageRating = songs.length
    ? (songs.reduce((sum, song) => sum + song.rating, 0) / songs.length).toFixed(1)
    : "-";
  const highRatedCount = songs.filter((song) => song.rating >= 7).length;

  return (
    <main className="page-shell flex flex-1 flex-col gap-5 pb-10">
      <header className="card p-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/60">Behroozreview single song rating</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl" style={{ fontFamily: "var(--font-title)" }}>
              Behroozreview single song rating
            </h1>
            <div className="max-w-2xl space-y-1 text-sm text-foreground/80 sm:text-base">
              <p>
                Twitter:{" "}
                <a className="underline decoration-foreground/35 underline-offset-4 hover:decoration-foreground/75" href="https://x.com/behroozreview" target="_blank" rel="noreferrer">
                  https://x.com/behroozreview
                </a>
              </p>
              <p>
                Articles:{" "}
                <a className="underline decoration-foreground/35 underline-offset-4 hover:decoration-foreground/75" href="https://behroozqa.wordpress.com/" target="_blank" rel="noreferrer">
                  https://behroozqa.wordpress.com/
                </a>
              </p>
              <p>
                Podcast:{" "}
                <a className="underline decoration-foreground/35 underline-offset-4 hover:decoration-foreground/75" href="https://soundcloud.com/davandeh" target="_blank" rel="noreferrer">
                  https://soundcloud.com/davandeh
                </a>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 sm:max-w-xl sm:grid-cols-4">
              <div className="soft-panel p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/65">Shown</p>
                <p className="text-xl font-semibold">{songs.length}</p>
              </div>
              <div className="soft-panel p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/65">Average</p>
                <p className="text-xl font-semibold">{averageRating}/9</p>
              </div>
              <div className="soft-panel p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/65">7+ Rated</p>
                <p className="text-xl font-semibold">{highRatedCount}</p>
              </div>
              <div className="soft-panel p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/65">Year</p>
                <p className="text-xl font-semibold">{selectedYearValue === "all" ? "All" : selectedYearValue}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Link className="button button-primary" href="/stats">
              View statistics
            </Link>
            <Link className="button" href="/admin">
              {authConfigured ? "Open admin panel" : "Setup admin"}
            </Link>
            {authConfigured ? (
              <Link className="button" href="/api/auth/signin">
                Admin sign in
              </Link>
            ) : null}
          </div>
        </div>

        <PublicSongFilters
          key={`${q ?? ""}|${selectedYearValue}|${params.rating ?? ""}`}
          years={years}
          initialQ={q}
          initialYear={selectedYearValue}
          defaultYear={defaultYearValue}
          initialRating={params.rating}
        />
      </header>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-foreground/10 bg-[var(--surface-muted)] px-5 py-3">
          <p className="text-sm font-medium text-foreground/80">{songs.length} singles found</p>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">Sorted by latest year</p>
        </div>

        <div className="md:hidden">
          <ul className="divide-y divide-foreground/10">
            {songs.map((song) => (
              <li key={song.id} className={`${getPublicRatingClass(song.rating)} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/songs/${song.id}`} className="text-base font-semibold leading-snug hover:underline">
                      {song.title}
                    </Link>
                    <p className="text-sm text-foreground/75">{song.artist || "Unknown artist"}</p>
                  </div>
                  <span className="rounded-full border border-foreground/15 bg-white/65 px-2 py-0.5 text-xs font-semibold">
                    {song.rating}/9
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-foreground/75">
                  <span>{song.persianYear}</span>
                  {song.url ? <SongSourceLink href={song.url} compact /> : <span>-</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden w-full min-w-[700px] text-left md:table">
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
                  className={`${getPublicRatingClass(song.rating)} border-b border-foreground/10 transition-colors hover:bg-black/5 last:border-b-0`}
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
