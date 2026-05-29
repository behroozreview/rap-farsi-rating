"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteSongButtonProps = {
  songId: number;
};

export function DeleteSongButton({ songId }: DeleteSongButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm("Delete this song?");
    if (!ok) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/songs/${songId}`, {
      method: "DELETE",
    });

    setLoading(false);
    if (!response.ok) {
      window.alert("Could not delete song");
      return;
    }

    router.refresh();
  }

  return (
    <button className="button button-danger px-3 py-1.5 text-sm" onClick={onDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
