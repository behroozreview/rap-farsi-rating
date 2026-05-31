import Link from "next/link";

import { isAuthConfigured } from "@/lib/auth-config";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { listSongs } from "@/lib/songs";

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
  const year = params.year ? Number(params.year) : undefined;
  const rating = params.rating ? Number(params.rating) : undefined;
  const authConfigured = isAuthConfigured();

  let songs;

  try {
    songs = await listSongs({ q, year, rating });
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Song archive is not configured yet"
          description="The public list needs a database connection before it can load your ratings."
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
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/70">RapFarsi Archive</p>
            <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
              Song Ratings (0-9)
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
            placeholder="Search title"
            defaultValue={q}
          />
          <input
            className="pill w-36"
            type="number"
            min={1350}
            max={1499}
            name="year"
            placeholder="Persian year"
            defaultValue={year}
          />
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
          <p className="text-sm text-foreground/75">{songs.length} songs found</p>
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
                <tr key={song.id} className="border-b border-foreground/10 last:border-b-0">
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
                        Open Link
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
    </main>
  );
}
