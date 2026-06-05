import Link from "next/link";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getPublicSongStats, listSongYears, resolveYearFilter } from "@/lib/songs";
import { getPublicRatingClass, getPublicScoreBarClass } from "@/lib/song-colors";

type StatsPageProps = {
  searchParams: Promise<{
    year?: string;
  }>;
};

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = await searchParams;
  const yearParam = params.year?.trim();

  let stats;
  let years;
  let selectedYearValue = "all";

  try {
    years = await listSongYears();
    const latestYear = years[0];
    const { year: selectedYear, value } = resolveYearFilter(yearParam, latestYear);
    selectedYearValue = value;

    stats = await getPublicSongStats(selectedYear);
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Singles statistics are not configured yet"
          description="This page needs the database connection before it can show archive statistics."
        />
      );
    }

    throw error;
  }

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 pb-12">
      <header className="card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 border-b border-foreground/12 pb-8 lg:grid-cols-[1.65fr_0.95fr] lg:gap-10">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-foreground/58">Archive statistics</p>
            <h1 className="mt-2 text-5xl leading-none sm:text-7xl lg:text-[5.2rem]" style={{ fontFamily: "var(--font-title)" }}>
              Patterns behind the scores.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/78 sm:text-base">
              Read the archive through score spread, yearly output, and artist frequency, with the current year scope applied across the full page.
            </p>
          </div>

          <aside className="flex flex-col justify-between gap-6 border-t border-foreground/12 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <form className="grid gap-2" action="/stats" method="get">
              <label className="text-[0.8rem] font-medium uppercase tracking-[0.18em] text-foreground/72">
                Year scope
                <select className="pill mt-2" name="year" defaultValue={selectedYearValue}>
                  <option value="all">All years</option>
                  {years.map((itemYear) => (
                    <option key={itemYear} value={itemYear}>
                      {itemYear}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-primary" type="submit">Update analytics</button>
            </form>

            <div className="grid gap-2">
              <Link className="button" href="/">
                Back to singles
              </Link>
              <Link className="button" href="/admin">
                Open admin
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-foreground/12 pt-5 text-center">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Tracks</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{stats.totalSongs}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Years</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{stats.releasesByYear.length}</p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Artists</p>
                <p className="mt-1 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{stats.topArtists.length}</p>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card p-5 sm:p-6 lg:col-span-1">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-foreground/58">Score distribution</p>
          <p className="mt-2 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>How the archive scores.</p>
          <p className="mt-3 text-sm leading-6 text-foreground/75">A compact read on how ratings are distributed across the current selection.</p>
          <div className="mt-4 space-y-3">
            {stats.scoreDistribution.length > 0 ? (
              stats.scoreDistribution.map((item) => {
                const width = stats.totalSongs ? Math.max((item.count / stats.totalSongs) * 100, 4) : 4;

                return (
                  <div key={item.rating} className={`border border-foreground/10 p-3 ${getPublicRatingClass(item.rating)}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.rating}/9</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-foreground/10">
                      <div
                        className={`h-1.5 ${getPublicScoreBarClass(item.rating)}`}
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

        <article className="card p-5 sm:p-6 lg:col-span-1">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-foreground/58">Singles per year</p>
          <p className="mt-2 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>Release cadence.</p>
          <p className="mt-3 text-sm leading-6 text-foreground/75">Released singles grouped by Persian year inside the current archive view.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.releasesByYear.length > 0 ? (
              stats.releasesByYear.map((item) => (
                <li key={item.year} className="flex items-center justify-between border-b border-foreground/10 px-1 py-2 last:border-b-0">
                  <span>{item.year}</span>
                  <span>{item.count}</span>
                </li>
              ))
            ) : (
              <li className="text-foreground/65">No singles yet.</li>
            )}
          </ul>
        </article>

        <article className="card p-5 sm:p-6 lg:col-span-1">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-foreground/58">Top artists</p>
          <p className="mt-2 text-3xl leading-none" style={{ fontFamily: "var(--font-title)" }}>Most represented voices.</p>
          <p className="mt-3 text-sm leading-6 text-foreground/75">Artists with the highest number of released singles in this archive.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topArtists.length > 0 ? (
              stats.topArtists.map((item) => (
                <li key={item.artist} className="flex items-center justify-between border-b border-foreground/10 px-1 py-2 last:border-b-0">
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
