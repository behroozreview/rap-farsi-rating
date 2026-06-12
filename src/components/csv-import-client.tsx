"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/section-heading";

type PreviewError = {
  row: number;
  error: string;
};

type PreviewRow = {
  title: string;
  artist?: string;
  url?: string;
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

type ImportMode = "csv" | "paste";

export function CsvImportClient() {
  const [mode, setMode] = useState<ImportMode>("csv");
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function resetPreviewState() {
    setPreview(null);
    setStatus("");
  }

  function onModeChange(nextMode: ImportMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    resetPreviewState();
  }

  async function onPreviewCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetPreviewState();
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

  async function onPreviewPaste(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetPreviewState();

    if (!pastedText.trim()) {
      setStatus("Paste spreadsheet rows first.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/import/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pastedText,
        fileName: "spreadsheet_paste",
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Could not preview pasted rows");
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
    <section className="card p-5 sm:p-6">
      <SectionHeading
        title="Import songs"
        description="Use CSV upload or paste rows directly from Google Sheets in this same view."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={`button ${mode === "csv" ? "button-primary" : ""}`}
          type="button"
          onClick={() => onModeChange("csv")}
          disabled={loading}
        >
          Upload CSV
        </button>
        <button
          className={`button ${mode === "paste" ? "button-primary" : ""}`}
          type="button"
          onClick={() => onModeChange("paste")}
          disabled={loading}
        >
          Paste Spreadsheet Rows
        </button>
      </div>

      {mode === "csv" ? (
        <form className="soft-panel mt-4 grid gap-3 p-3 md:grid-cols-[1.6fr_auto]" onSubmit={onPreviewCsv}>
          <label className="text-sm font-medium text-foreground/82">
            CSV file
            <input className="pill mt-1" type="file" name="file" accept=".csv,text/csv" required />
          </label>
          <div className="flex items-end">
            <button className="button button-primary w-full md:w-auto" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Preview CSV"}
            </button>
          </div>
        </form>
      ) : (
        <form className="soft-panel mt-4 grid gap-3 p-3" onSubmit={onPreviewPaste}>
          <label className="text-sm font-medium text-foreground/82">
            Paste rows copied from Google Sheets
            <textarea
              className="pill mt-1 min-h-40"
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder={"title\tartist\turl\trating\tpersian_year"}
              required
            />
          </label>
          <div className="flex items-end">
            <button className="button button-primary w-full md:w-auto" type="submit" disabled={loading || !pastedText.trim()}>
              {loading ? "Processing..." : "Preview Pasted Rows"}
            </button>
          </div>
        </form>
      )}

      {status ? <p className="mt-3 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-foreground/82">{status}</p> : null}

      {preview ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="soft-panel px-3 py-2">Total rows: {preview.totalRows}</div>
            <div className="soft-panel px-3 py-2">Valid rows: {preview.validCount}</div>
            <div className="soft-panel px-3 py-2">Errors: {preview.errorCount}</div>
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
                    <tr key={`${row.title}-${index}`} className="border-b border-foreground/10 transition-colors hover:bg-black/5 last:border-b-0">
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
            <div className="rounded-lg border border-red-300/45 bg-red-100 p-3 text-sm text-red-700">
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

          <div className="flex flex-wrap gap-2">
            <button
              className="button button-primary"
              disabled={loading || preview.validRows.length === 0}
              onClick={onImport}
              type="button"
            >
              Import Valid Rows
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
