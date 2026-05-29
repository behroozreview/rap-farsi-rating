import { SongEditorForm } from "@/components/song-editor-form";

export default function AdminNewSongPage() {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
        Add Song Manually
      </h2>
      <SongEditorForm mode="create" />
    </section>
  );
}
