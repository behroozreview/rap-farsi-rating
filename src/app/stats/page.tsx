import Link from "next/link";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getPublicSongStats } from "@/lib/songs";
import { getScoreBarClass } from "@/lib/song-colors";

export default async function StatsPage() {
  let stats;

  try {
    stats = await getPublicSongStats();
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
    <main className="page-shell flex flex-1 flex-col gap-4 pb-10">
      <header className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/70">RapFarsi Singles Archive</p>
            <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
              Singles Statistics
            </h1>
            <p className="mt-2 text-sm text-foreground/75">
              A summary of score distribution, yearly releases, and the most active artists.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="pill" href="/">
              Back to Singles
            </Link>
            <Link className="pill" href="/admin">
              Admin Panel
            </Link>
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
