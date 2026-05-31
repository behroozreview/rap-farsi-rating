"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClearImportedSongsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClear() {
    const ok = window.confirm(
      "Delete all imported songs? Manually added songs will be kept. This action cannot be undone."
    );
    if (!ok) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/admin/imported-songs", {
      method: "DELETE",
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      window.alert(data.error ?? "Could not clear imported songs");
      return;
    }

    window.alert(`Deleted ${data.deletedCount} imported songs.`);
    router.refresh();
  }

  return (
    <button className="button button-danger" onClick={onClear} disabled={loading}>
      {loading ? "Clearing..." : "Clear Imported Songs"}
    </button>
  );
}
