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
    <main className="page-shell flex flex-1 flex-col gap-6 pb-12">
      <header className="card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 border-b border-foreground/12 pb-8 lg:grid-cols-[1.75fr_0.95fr] lg:gap-10">
          <div className="space-y-5">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-foreground/58">Behroozreview single song rating</p>
            <div className="max-w-4xl space-y-4">
              <p className="max-w-2xl text-sm leading-7 text-foreground/78 sm:text-base">
                Behroozreview tracks individual RapFarsi songs through rating, year, and source context with a cleaner editorial lens.
              </p>
            </div>

            <div className="grid gap-2 border-t border-foreground/12 pt-5 sm:max-w-3xl sm:grid-cols-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Shown</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{songs.length}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Average</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{averageRating}/9</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">7+ Rated</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{highRatedCount}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Year</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{selectedYearValue === "all" ? "All" : selectedYearValue}</p>
              </div>
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-6 border-t border-foreground/12 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <div className="space-y-3 text-sm text-foreground/78">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-foreground/55">Elsewhere</p>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://x.com/behroozreview" target="_blank" rel="noreferrer">
                Twitter
              </a>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://behroozqa.wordpress.com/" target="_blank" rel="noreferrer">
                Articles
              </a>
              <a className="block border-b border-foreground/12 pb-2 transition-colors hover:text-foreground/100" href="https://soundcloud.com/davandeh" target="_blank" rel="noreferrer">
                Podcast
              </a>
            </div>

            <div className="grid gap-2">
              <Link className="button button-primary" href="/stats">
                Read the stats
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
          </aside>
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
        <div className="grid gap-2 border-b border-foreground/10 bg-[var(--surface-muted)] px-5 py-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-foreground/55">Archive</p>
            <p className="mt-1 text-2xl leading-none" style={{ fontFamily: "var(--font-title)" }}>
              {songs.length} singles in view
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">Sorted by latest year</p>
        </div>

        <div className="md:hidden">
          <ul className="divide-y divide-foreground/10">
            {songs.map((song) => (
              <li key={song.id} className={`${getPublicRatingClass(song.rating)} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/songs/${song.id}`} className="text-xl leading-snug hover:underline" style={{ fontFamily: "var(--font-title)" }}>
                      {song.title}
                    </Link>
                    <p className="text-sm text-foreground/75">{song.artist || "Unknown artist"}</p>
                  </div>
                  <span className="rounded-sm border border-foreground/15 bg-white/65 px-2 py-0.5 text-xs font-semibold">
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
                    <Link href={`/songs/${song.id}`} className="text-xl hover:underline" style={{ fontFamily: "var(--font-title)" }}>
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
