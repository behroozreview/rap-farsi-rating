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

function normalizeCsvUrl(rawUrl?: string) {
  const value = rawUrl?.trim();
  if (!value) {
    return undefined;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
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
      url: normalizeCsvUrl(row.url ?? row.link),
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

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isLikelyUrl(value?: string) {
  if (!value) {
    return false;
  }

  return /^https?:\/\//i.test(value.trim());
}

type SpreadsheetField = "title" | "artist" | "url" | "rating" | "persianYear";

const HEADER_ALIAS_TO_FIELD: Record<string, SpreadsheetField> = {
  title: "title",
  songtitle: "title",
  track: "title",
  song: "title",
  name: "title",
  artist: "artist",
  rapper: "artist",
  singer: "artist",
  performer: "artist",
  url: "url",
  link: "url",
  source: "url",
  rating: "rating",
  score: "rating",
  rate: "rating",
  year: "persianYear",
  persianyear: "persianYear",
  jalaliyear: "persianYear",
};

function getHeaderMap(firstRow: string[]) {
  const map: Partial<Record<SpreadsheetField, number>> = {};

  firstRow.forEach((rawHeader, index) => {
    const normalized = normalizeHeader(rawHeader);
    const field = HEADER_ALIAS_TO_FIELD[normalized];
    if (field && map[field] === undefined) {
      map[field] = index;
    }
  });

  return map;
}

function toNormalizedFromCols(cols: string[]) {
  if (cols.length >= 5) {
    return {
      title: cols[0],
      artist: cols[1],
      url: normalizeCsvUrl(cols[2]),
      rating: cols[3],
      persianYear: cols[4],
    };
  }

  if (cols.length === 4) {
    if (isLikelyUrl(cols[1])) {
      return {
        title: cols[0],
        artist: "",
        url: normalizeCsvUrl(cols[1]),
        rating: cols[2],
        persianYear: cols[3],
      };
    }

    return {
      title: cols[0],
      artist: cols[1],
      url: normalizeCsvUrl(cols[2]),
      rating: cols[2],
      persianYear: cols[3],
    };
  }

  if (cols.length >= 3) {
    return {
      title: cols[0],
      artist: "",
      url: undefined,
      rating: cols[1],
      persianYear: cols[2],
    };
  }

  return {
    title: cols[0] ?? "",
    artist: "",
    url: undefined,
    rating: cols[1],
    persianYear: cols[2],
  };
}

export function parseSongSpreadsheetText(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { validRows: [], errors: [] };
  }

  const rows = lines.map((line) => line.split("\t").map((cell) => cell.trim()));
  const headerMap = getHeaderMap(rows[0]);
  const hasHeader = headerMap.title !== undefined && headerMap.rating !== undefined && headerMap.persianYear !== undefined;

  const validRows: CsvSongInput[] = [];
  const errors: CsvRowError[] = [];

  rows.forEach((cols, index) => {
    if (hasHeader && index === 0) {
      return;
    }

    const baseRowNumber = index + 1;
    const rowNumber = hasHeader ? baseRowNumber + 1 : baseRowNumber;

    const normalized = hasHeader
      ? {
          title: cols[headerMap.title ?? 0] ?? "",
          artist: cols[headerMap.artist ?? -1] ?? "",
          url: normalizeCsvUrl(cols[headerMap.url ?? -1]),
          rating: cols[headerMap.rating ?? -1],
          persianYear: cols[headerMap.persianYear ?? -1],
        }
      : toNormalizedFromCols(cols);

    const { artist, title } = splitArtistAndTitle(normalized.title, normalized.artist);
    const result = csvSongSchema.safeParse({
      title,
      artist,
      url: normalized.url,
      rating: normalized.rating,
      persianYear: normalized.persianYear,
    });

    if (!result.success) {
      errors.push({
        row: rowNumber,
        error: result.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }

    validRows.push(result.data);
  });

  return { validRows, errors };
}
