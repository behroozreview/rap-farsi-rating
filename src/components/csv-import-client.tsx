"use client";

import { useState } from "react";

type PreviewError = {
  row: number;
  error: string;
};

type PreviewRow = {
  title: string;
  artist?: string;
  url: string;
  rating: number;
  persianYear: number;
};

type PreviewPayload = {
  fileName: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  errors: PreviewError[];
  previewRows: PreviewRow[];
  validRows: PreviewRow[];
};

export function CsvImportClient() {
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setPreview(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/import/preview", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Could not preview CSV");
      return;
    }

    setPreview(data);
    setStatus(`Preview ready: ${data.validCount} valid rows, ${data.errorCount} invalid rows.`);
  }

  async function onImport() {
    if (!preview) {
      return;
    }

    setLoading(true);
    setStatus("Importing rows...");

    const response = await fetch("/api/import/csv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: preview.fileName,
        rows: preview.validRows,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Import failed");
      return;
    }

    setStatus(`Import complete: ${data.importedCount} imported, ${data.failedCount} failed.`);
  }

  return (
    <section className="card p-5">
      <form className="flex flex-wrap gap-3" onSubmit={onPreview}>
        <input className="pill" type="file" name="file" accept=".csv,text/csv" required />
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? "Processing..." : "Preview CSV"}
        </button>
      </form>

      {status ? <p className="mt-3 text-sm text-foreground/80">{status}</p> : null}

      {preview ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[var(--surface-strong)] p-3 text-sm">
            Total rows: {preview.totalRows}, Valid: {preview.validCount}, Errors: {preview.errorCount}
          </div>

          {preview.previewRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/15">
                    <th className="py-2">Title</th>
                    <th className="py-2">Artist</th>
                    <th className="py-2">Year</th>
                    <th className="py-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.previewRows.map((row, index) => (
                    <tr key={`${row.title}-${index}`} className="border-b border-foreground/10 last:border-b-0">
                      <td className="py-2">{row.title}</td>
                      <td className="py-2">{row.artist || "-"}</td>
                      <td className="py-2">{row.persianYear}</td>
                      <td className="py-2">{row.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {preview.errors.length > 0 ? (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              <p className="font-semibold">Validation errors:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {preview.errors.slice(0, 10).map((error) => (
                  <li key={`${error.row}-${error.error}`}>
                    Row {error.row}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            className="button button-primary"
            disabled={loading || preview.validRows.length === 0}
            onClick={onImport}
            type="button"
          >
            Import Valid Rows
          </button>
        </div>
      ) : null}
    </section>
  );
}
