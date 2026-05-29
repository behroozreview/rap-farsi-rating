import Papa from "papaparse";

import { csvSongSchema, type CsvSongInput } from "@/lib/validation/song";

export type CsvRowError = { row: number; error: string };

export type CsvParseResult = {
  validRows: CsvSongInput[];
  errors: CsvRowError[];
};

type CsvRawRow = {
  title?: string;
  artist?: string;
  url?: string;
  rating?: string | number;
  persian_year?: string | number;
  persianYear?: string | number;
};

export function parseSongCsv(text: string): CsvParseResult {
  const parsed = Papa.parse<CsvRawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const validRows: CsvSongInput[] = [];
  const errors: CsvRowError[] = [];

  parsed.data.forEach((row, index) => {
    const persianYear = row.persian_year ?? row.persianYear;

    const normalized = {
      title: row.title,
      artist: row.artist,
      url: row.url,
      rating: row.rating,
      persianYear,
    };

    const result = csvSongSchema.safeParse(normalized);
    if (!result.success) {
      errors.push({
        row: index + 2,
        error: result.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }

    validRows.push(result.data);
  });

  return { validRows, errors };
}
