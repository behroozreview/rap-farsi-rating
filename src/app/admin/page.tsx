import { DatabaseSetupNotice } from "@/components/database-setup-notice";
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
      <article className="card p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Total Songs</p>
        <p className="mt-3 text-5xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          {stats.totalSongs}
        </p>
      </article>

      <article className="card p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/60">Top Persian Years</p>
        <ul className="mt-3 space-y-2 text-sm">
          {stats.topYears.map((item) => (
            <li key={item.year} className="flex justify-between">
              <span>{item.year}</span>
              <span>{item.count} songs</span>
            </li>
          ))}
          {stats.topYears.length === 0 ? <li>No songs yet.</li> : null}
        </ul>
      </article>
    </section>
  );
}
