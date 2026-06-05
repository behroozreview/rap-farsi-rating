import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { SectionHeading } from "@/components/section-heading";
import { ClearImportedSongsButton } from "@/components/clear-imported-songs-button";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getSongStats } from "@/lib/songs";

export default async function AdminDashboardPage() {
  let stats;

  try {
    stats = await getSongStats();
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Admin dashboard is waiting for database setup"
          description="Admin stats cannot load until the project has a valid database connection."
        />
      );
    }

    throw error;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="card p-5 sm:col-span-2 sm:p-6">
        <SectionHeading
          eyebrow="Overview"
          title="Dashboard snapshot"
          description="Quick status of archive size and release distribution."
        />
      </article>

      <article className="card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Total Songs</p>
        <p className="mt-3 text-5xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          {stats.totalSongs}
        </p>
        <p className="mt-2 text-sm text-foreground/70">All songs currently available in your archive database.</p>
      </article>

      <article className="card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Top Persian Years</p>
        <ul className="mt-3 space-y-2 text-sm">
          {stats.topYears.map((item) => (
            <li key={item.year} className="flex justify-between rounded-lg border border-foreground/10 bg-[var(--surface-strong)] px-3 py-2">
              <span>{item.year}</span>
              <span>{item.count} songs</span>
            </li>
          ))}
          {stats.topYears.length === 0 ? <li>No songs yet.</li> : null}
        </ul>
      </article>

      <article className="card p-5 sm:col-span-2 sm:p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/60">Maintenance</p>
        <p className="mt-2 text-sm text-foreground/75">
          Remove all songs added via CSV import. Manually created songs are preserved.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ClearImportedSongsButton />
        </div>
      </article>
    </section>
  );
}
