import { notFound } from "next/navigation";

import { SongEditorForm } from "@/components/song-editor-form";
import { getSongById } from "@/lib/songs";

type EditSongPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { id } = await params;
  const song = await getSongById(Number(id));

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
