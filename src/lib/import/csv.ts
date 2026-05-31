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
  link?: string;
  rating?: string | number;
  score?: string | number;
  year?: string | number;
  persian_year?: string | number;
  persianYear?: string | number;
  persianyear?: string | number;
};

function splitArtistAndTitle(rawTitle?: string, rawArtist?: string) {
  const title = rawTitle?.trim();
  const artist = rawArtist?.trim();

  if (!title) {
    return { artist, title };
  }

  if (artist) {
    return { artist, title };
  }

  const separators = [" - ", " – ", " — "];
  for (const separator of separators) {
    const index = title.indexOf(separator);
    if (index > 0) {
      const candidateArtist = title.slice(0, index).trim();
      const candidateTitle = title.slice(index + separator.length).trim();

      if (candidateArtist && candidateTitle) {
        return { artist: candidateArtist, title: candidateTitle };
      }
    }
  }

  return { artist: "", title };
}

export function parseSongCsv(text: string): CsvParseResult {
  const parsed = Papa.parse<CsvRawRow>(text, {
    header: true,
    skipEmptyLines: true,
    // Normalize incoming headers to accept variants like Title/Score/Link/Year.
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const validRows: CsvSongInput[] = [];
  const errors: CsvRowError[] = [];

  parsed.data.forEach((row, index) => {
    const { artist, title } = splitArtistAndTitle(row.title, row.artist);
    const persianYear = row.persian_year ?? row.persianYear ?? row.persianyear ?? row.year;

    const normalized = {
      title,
      artist,
      url: row.url ?? row.link,
      rating: row.rating ?? row.score,
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
