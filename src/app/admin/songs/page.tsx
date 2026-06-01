import Link from "next/link";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { DeleteSongButton } from "@/components/delete-song-button";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getRatingRowClass } from "@/lib/song-colors";
import { listSongYears, listSongs, resolveYearFilter } from "@/lib/songs";

type SongsAdminPageProps = {
  searchParams: Promise<{
    q?: string;
    year?: string;
    rating?: string;
  }>;
};

export default async function SongsAdminPage({ searchParams }: SongsAdminPageProps) {
  const params = await searchParams;
  const yearParam = params.year?.trim();
  let songs;
  let years;

  try {
    years = await listSongYears();

    const latestYear = years[0];
    const { year: selectedYear } = resolveYearFilter(yearParam, latestYear);

    songs = await listSongs({
      q: params.q,
      year: selectedYear,
      rating: params.rating ? Number(params.rating) : undefined,
    });
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Song management is unavailable"
          description="Admin song management needs a database connection before it can list or edit songs."
        />
      );
    }

    throw error;
  }

  const latestYear = years[0];
  const { value: selectedYearValue } = resolveYearFilter(yearParam, latestYear);

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          Manage Songs
        </h2>
        <Link className="button button-primary" href="/admin/songs/new">
          Add New Song
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/songs" method="get">
        <input
          className="pill min-w-56"
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search title or artist"
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
          defaultValue={params.rating}
          placeholder="Rating"
        />
        <button className="button button-primary" type="submit">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-foreground/15 uppercase tracking-wide text-foreground/65">
              <th className="py-2">Title</th>
              <th className="py-2">Artist</th>
              <th className="py-2">Year</th>
              <th className="py-2">Rating</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr
                key={song.id}
                className={`${getRatingRowClass(song.rating)} border-b border-foreground/10 last:border-b-0`}
              >
                <td className="py-2">{song.title}</td>
                <td className="py-2">{song.artist || "-"}</td>
                <td className="py-2">{song.persianYear}</td>
                <td className="py-2">{song.rating}/9</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link className="pill text-xs" href={`/admin/songs/${song.id}/edit`}>
                      Edit
                    </Link>
                    <DeleteSongButton songId={song.id} />
                  </div>
                </td>
              </tr>
            ))}
            {songs.length === 0 ? (
              <tr>
                <td className="py-3 text-foreground/65" colSpan={5}>
                  No songs found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
