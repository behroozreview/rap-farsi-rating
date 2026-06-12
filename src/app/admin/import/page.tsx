import { CsvImportClient } from "@/components/csv-import-client";

export default function AdminImportPage() {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
        Bulk Import
      </h2>
      <p className="mb-3 text-sm text-foreground/70">
        In this same view, upload CSV or paste copied Google Sheets rows. Expected fields: title, rating,
        persian_year, with optional artist and url.
      </p>
      <CsvImportClient />
    </section>
  );
}
