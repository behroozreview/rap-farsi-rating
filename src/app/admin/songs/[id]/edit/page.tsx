import { notFound } from "next/navigation";

import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { SongEditorForm } from "@/components/song-editor-form";
import { isMissingDatabaseConfigError } from "@/lib/database-errors";
import { getSongById } from "@/lib/songs";

type EditSongPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { id } = await params;
  let song;

  try {
    song = await getSongById(Number(id));
  } catch (error) {
    if (isMissingDatabaseConfigError(error)) {
      return (
        <DatabaseSetupNotice
          title="Song editor is unavailable"
          description="This edit screen needs the database connection before it can load the selected song."
        />
      );
    }

    throw error;
  }

  if (!song) {
    notFound();
  }

  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
        Edit Song
      </h2>
      <SongEditorForm
        mode="edit"
        songId={song.id}
        initialValue={{
          title: song.title,
          artist: song.artist,
          url: song.url,
          rating: song.rating,
          persianYear: song.persianYear,
          notes: song.notes,
        }}
      />
    </section>
  );
}
