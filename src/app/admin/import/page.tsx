import { CsvImportClient } from "@/components/csv-import-client";

export default function AdminImportPage() {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-title)" }}>
        Bulk Import from CSV
      </h2>
      <p className="mb-3 text-sm text-foreground/70">
        Expected columns: title,url,rating,persian_year and optional artist.
      </p>
      <CsvImportClient />
    </section>
  );
}
