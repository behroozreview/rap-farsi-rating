import Link from "next/link";
import { notFound } from "next/navigation";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getSongById } from "@/lib/songs";
import { SongSourceLink } from "@/components/song-source-link";

type SongPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SongPage({ params }: SongPageProps) {
  const { id } = await params;
  let song;

  try {
    song = await getSongById(Number(id));
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Single detail is unavailable"
          description="This page needs the database connection before individual single entries can load."
        />
      );
    }

    throw error;
  }

  if (!song) {
    notFound();
  }

  return (
    <main className="page-shell">
      <article className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/65">Single Detail</p>
        <h1 className="mt-2 text-4xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
          {song.title}
        </h1>
        <div className="mt-4 grid gap-3 text-base sm:grid-cols-2">
          <p>
            <span className="text-foreground/60">Artist:</span> {song.artist || "-"}
            <SongSourceLink href={song.url} className="button button-primary" />
          </p>
          <p>
            <span className="text-foreground/60">Rating:</span> {song.rating}/9
          </p>
          <p>
            <span className="text-foreground/60">Added:</span>{" "}
            {new Date(song.createdAt).toLocaleDateString()}
          </p>
        </div>

        {song.notes ? (
          <p className="mt-4 rounded-lg bg-[var(--surface-strong)] p-3 text-sm leading-6">{song.notes}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {song.url ? (
            <a className="button button-primary" href={song.url} target="_blank" rel="noreferrer">
              Open Single Link
            </a>
          ) : null}
          <Link className="button pill" href="/">
            Back to Singles
          </Link>
        </div>
      </article>
    </main>
  );
}
