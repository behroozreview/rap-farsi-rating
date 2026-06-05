import Link from "next/link";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { DeleteSongButton } from "@/components/delete-song-button";
import { SectionHeading } from "@/components/section-heading";
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
    <section className="card p-5 sm:p-6">
      <SectionHeading
        className="mb-4"
        title="Manage songs"
        description={`${songs.length} results with current filters`}
        actions={
          <Link className="button button-primary" href="/admin/songs/new">
            Add new song
          </Link>
        }
      />

      <form className="soft-panel mb-5 grid gap-3 p-3 md:grid-cols-[1.8fr_0.8fr_0.8fr_auto]" action="/admin/songs" method="get">
        <label className="text-sm font-medium text-foreground/80">
          Search
          <input
            className="pill mt-1 min-w-0"
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Title or artist"
          />
        </label>

        <label className="text-sm font-medium text-foreground/80">
          Year
          <select className="pill mt-1" name="year" defaultValue={selectedYearValue}>
            <option value="all">All years</option>
            {years.map((itemYear) => (
              <option key={itemYear} value={itemYear}>
                {itemYear}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-foreground/80">
          Min rating
          <select className="pill mt-1" name="rating" defaultValue={params.rating ?? ""}>
            <option value="">Any</option>
            {Array.from({ length: 10 }, (_, item) => (
              <option key={item} value={item}>
                {item}+
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button className="button button-primary w-full md:w-auto" type="submit">
            Apply filters
          </button>
        </div>
      </form>

      <div className="md:hidden">
        <ul className="space-y-2">
          {songs.map((song) => (
            <li key={song.id} className={`${getRatingRowClass(song.rating)} rounded-xl border border-foreground/10 p-3`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold leading-snug">{song.title}</p>
                  <p className="text-sm text-foreground/75">{song.artist || "-"}</p>
                </div>
                <span className="rounded-full border border-foreground/15 bg-white/70 px-2 py-0.5 text-xs font-semibold">
                  {song.rating}/9
                </span>
              </div>
              <div className="mt-2 text-sm text-foreground/78">Year: {song.persianYear}</div>
              <div className="mt-3 flex gap-2">
                <Link className="button text-xs" href={`/admin/songs/${song.id}/edit`}>
                  Edit
                </Link>
                <DeleteSongButton songId={song.id} />
              </div>
            </li>
          ))}
          {songs.length === 0 ? (
            <li className="rounded-xl border border-foreground/10 p-3 text-sm text-foreground/65">No songs found.</li>
          ) : null}
        </ul>
      </div>

      <div className="hidden overflow-x-auto md:block">
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
                className={`${getRatingRowClass(song.rating)} border-b border-foreground/10 transition-colors hover:bg-black/5 last:border-b-0`}
              >
                <td className="py-2">{song.title}</td>
                <td className="py-2">{song.artist || "-"}</td>
                <td className="py-2">{song.persianYear}</td>
                <td className="py-2">{song.rating}/9</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link className="button px-3 py-1.5 text-xs" href={`/admin/songs/${song.id}/edit`}>
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
