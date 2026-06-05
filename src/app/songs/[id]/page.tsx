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
    <main className="page-shell pb-12">
      <article className="card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="border-b border-foreground/12 pb-6">
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-foreground/58">Single detail</p>
          <h1 className="mt-3 text-5xl leading-none sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-title)" }}>
            {song.title}
          </h1>
        </div>

        <div className="grid gap-8 pt-6 lg:grid-cols-[1.4fr_0.95fr] lg:gap-10">
          <section>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="border-b border-foreground/10 pb-3">
                <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Artist</dt>
                <dd className="mt-2 text-2xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{song.artist || "-"}</dd>
              </div>
              <div className="border-b border-foreground/10 pb-3">
                <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Rating</dt>
                <dd className="mt-2 text-2xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{song.rating}/9</dd>
              </div>
              <div className="border-b border-foreground/10 pb-3">
                <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Year</dt>
                <dd className="mt-2 text-2xl leading-none" style={{ fontFamily: "var(--font-title)" }}>{song.persianYear}</dd>
              </div>
              <div className="border-b border-foreground/10 pb-3">
                <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Added</dt>
                <dd className="mt-2 text-lg text-foreground/82">{new Date(song.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>

            {song.notes ? (
              <div className="mt-8 border-l-2 border-foreground/15 pl-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/55">Notes</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/82 sm:text-base">{song.notes}</p>
              </div>
            ) : null}
          </section>

          <aside className="flex flex-col gap-3 border-t border-foreground/12 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            {song.url ? <SongSourceLink href={song.url} className="button button-primary" /> : null}
            {song.url ? (
              <a className="button" href={song.url} target="_blank" rel="noreferrer">
                Open single link
              </a>
            ) : null}
            <Link className="button" href="/">
              Back to singles
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
