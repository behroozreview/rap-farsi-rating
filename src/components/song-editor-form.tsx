"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SongFormData = {
  title: string;
  artist: string;
  url: string;
  rating: number;
  persianYear: number;
  notes?: string | null;
};

type SongEditorFormProps = {
  mode: "create" | "edit";
  songId?: number;
  initialValue?: SongFormData;
};

export function SongEditorForm({ mode, songId, initialValue }: SongEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      artist: String(formData.get("artist") ?? ""),
      url: String(formData.get("url") ?? ""),
      rating: Number(formData.get("rating")),
      persianYear: Number(formData.get("persianYear")),
      notes: String(formData.get("notes") ?? ""),
    };

    const endpoint = mode === "create" ? "/api/songs" : `/api/songs/${songId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not save song");
      setLoading(false);
      return;
    }

    router.push("/admin/songs");
    router.refresh();
  }

  return (
    <form className="card flex flex-col gap-3 p-5" onSubmit={onSubmit}>
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input className="pill" name="title" required defaultValue={initialValue?.title ?? ""} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Artist
        <input className="pill" name="artist" defaultValue={initialValue?.artist ?? ""} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URL
        <input className="pill" name="url" required defaultValue={initialValue?.url ?? ""} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Rating (1-9)
          <input
            className="pill"
            type="number"
            min={1}
            max={9}
            name="rating"
            required
            defaultValue={initialValue?.rating ?? 5}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Persian Year
          <input
            className="pill"
            type="number"
            min={1350}
            max={1499}
            name="persianYear"
            required
            defaultValue={initialValue?.persianYear ?? 1405}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="pill min-h-28 rounded-xl" name="notes" defaultValue={initialValue?.notes ?? ""} />
      </label>

      {error ? <p className="rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

      <button className="button button-primary w-fit" type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "create" ? "Create Song" : "Update Song"}
      </button>
    </form>
  );
}
