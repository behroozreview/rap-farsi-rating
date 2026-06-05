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
    <main className="page-shell flex flex-1 flex-col gap-5 pb-10">
      <header className="card p-6 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/62">RapFarsi Singles Archive</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl" style={{ fontFamily: "var(--font-title)" }}>
              Insights and score patterns
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground/75 sm:text-base">
              Explore score distribution, release cadence per year, and which artists appear most in your archive.
            </p>
          </div>

          <div className="soft-panel p-4">
            <form className="grid gap-2" action="/stats" method="get">
              <label className="text-sm font-medium text-foreground/80">
                Year scope
                <select className="pill mt-1" name="year" defaultValue={selectedYearValue}>
                  <option value="all">All years</option>
                  {years.map((itemYear) => (
                    <option key={itemYear} value={itemYear}>
                      {itemYear}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-primary" type="submit">
                Update analytics
              </button>
            </form>

            <div className="mt-2 flex flex-wrap gap-2">
              <Link className="button" href="/">
                Back to singles
              </Link>
              <Link className="button" href="/admin">
                Open admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card p-5 lg:col-span-1">
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Score Distribution</p>
          <p className="mt-2 text-sm text-foreground/75">How the single scores spread across the archive.</p>
          <div className="mt-4 space-y-3">
            {stats.scoreDistribution.length > 0 ? (
              stats.scoreDistribution.map((item) => {
                const width = stats.totalSongs ? Math.max((item.count / stats.totalSongs) * 100, 4) : 4;

                return (
                  <div key={item.rating} className={`rounded-xl border border-foreground/10 p-2 ${getPublicRatingClass(item.rating)}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.rating}/9</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-foreground/10">
                      <div
                        className={`h-2 rounded-full ${getPublicScoreBarClass(item.rating)}`}
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
                <li key={item.year} className="flex items-center justify-between rounded-lg border border-foreground/8 bg-[var(--surface-strong)] px-3 py-2">
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
                <li key={item.artist} className="flex items-center justify-between rounded-lg border border-foreground/8 bg-[var(--surface-strong)] px-3 py-2">
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
