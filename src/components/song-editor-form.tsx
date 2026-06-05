"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SectionHeading } from "@/components/section-heading";

type SongFormData = {
  title: string;
  artist: string;
  url?: string;
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
    <form className="card flex flex-col gap-4 p-5 sm:p-6" onSubmit={onSubmit}>
      <SectionHeading
        title={mode === "create" ? "Create a new song" : "Edit song"}
        description="Fill in song details, rating, and release year for your archive."
      />

      <div className="soft-panel grid gap-3 p-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82 sm:col-span-2">
          Title
          <input className="pill" name="title" required defaultValue={initialValue?.title ?? ""} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82">
          Artist
          <input className="pill" name="artist" defaultValue={initialValue?.artist ?? ""} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82">
          URL
          <input className="pill" name="url" defaultValue={initialValue?.url ?? ""} placeholder="https://..." />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82">
          Rating (0-9)
          <select className="pill" name="rating" required defaultValue={String(initialValue?.rating ?? 5)}>
            {Array.from({ length: 10 }, (_, item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82">
          Persian Year
          <input className="pill" type="number" min={1350} max={1499} name="persianYear" required defaultValue={initialValue?.persianYear ?? 1405} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/82 sm:col-span-2">
          Notes
          <textarea className="pill min-h-32" name="notes" defaultValue={initialValue?.notes ?? ""} />
        </label>
      </div>

      {error ? <p className="rounded-lg border border-red-300/50 bg-red-100 p-2 text-sm text-red-700">{error}</p> : null}

      <button className="button button-primary w-fit" type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "create" ? "Create Song" : "Update Song"}
      </button>
    </form>
  );
}
