import { and, asc, count, desc, eq, ilike, isNotNull, ne, or, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { songs } from "@/db/schema";
import type { SongInput, SongPatchInput } from "@/lib/validation/song";

export type SongFilters = {
  q?: string;
  year?: number;
  rating?: number;
};

export type ScoreDistributionItem = {
  rating: number;
  count: number;
};

export type YearReleaseItem = {
  year: number;
  count: number;
};

export type ArtistReleaseItem = {
  artist: string;
  count: number;
};

export type PublicSongStats = {
  totalSongs: number;
  scoreDistribution: ScoreDistributionItem[];
  releasesByYear: YearReleaseItem[];
  topArtists: ArtistReleaseItem[];
};

export async function listSongs(filters: SongFilters = {}) {
  const db = getDb();

  const predicates = [];
  if (filters.q) {
    predicates.push(or(ilike(songs.title, `%${filters.q}%`), ilike(songs.artist, `%${filters.q}%`)));
  }
  if (filters.year) {
    predicates.push(eq(songs.persianYear, filters.year));
  }
  if (filters.rating) {
    predicates.push(eq(songs.rating, filters.rating));
  }

  const whereClause = predicates.length > 0 ? and(...predicates) : undefined;

  return db
    .select()
    .from(songs)
    .where(whereClause)
    .orderBy(desc(songs.persianYear), desc(songs.rating), asc(songs.title));
}

export async function listSongYears() {
  const db = getDb();

  const rows = await db
    .select({ year: songs.persianYear })
    .from(songs)
    .groupBy(songs.persianYear)
    .orderBy(desc(songs.persianYear));

  return rows.map((row) => row.year);
}

export async function getSongById(id: number) {
  const db = getDb();
  const [song] = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
  return song;
}

export async function createSong(input: SongInput, importedFrom?: string) {
  const db = getDb();
  const [song] = await db
    .insert(songs)
    .values({
      ...input,
      url: input.url ?? "",
      importedFrom,
      notes: input.notes ?? null,
      artist: input.artist ?? "",
    })
    .returning();

  return song;
}

export async function updateSong(id: number, input: SongPatchInput) {
  const db = getDb();
  const sanitizedInput = {
    ...input,
    ...(Object.prototype.hasOwnProperty.call(input, "url") ? { url: input.url ?? "" } : {}),
  };

  const [song] = await db
    .update(songs)
    .set({
      ...sanitizedInput,
      updatedAt: sql`now()`,
    })
    .where(eq(songs.id, id))
    .returning();

  return song;
}

export async function deleteSong(id: number) {
  const db = getDb();
  const [song] = await db.delete(songs).where(eq(songs.id, id)).returning();
  return song;
}

export async function deleteImportedSongs() {
  const db = getDb();
  const deleted = await db
    .delete(songs)
    .where(and(isNotNull(songs.importedFrom), ne(songs.importedFrom, "manual")))
    .returning({ id: songs.id });

  return deleted.length;
}

export async function getSongStats() {
  const db = getDb();

  const [totalRow] = await db.select({ value: count() }).from(songs);

  const topYears = await db
    .select({
      year: songs.persianYear,
      count: count(),
    })
    .from(songs)
    .groupBy(songs.persianYear)
    .orderBy(desc(count()), desc(songs.persianYear))
    .limit(5);

  return {
    totalSongs: totalRow?.value ?? 0,
    topYears,
  };
}

export async function getPublicSongStats(): Promise<PublicSongStats> {
  const db = getDb();

  const [totalRow, scoreDistribution, releasesByYear, topArtists] = await Promise.all([
    db.select({ value: count() }).from(songs),
    db
      .select({ rating: songs.rating, count: count() })
      .from(songs)
      .groupBy(songs.rating)
      .orderBy(asc(songs.rating)),
    db
      .select({ year: songs.persianYear, count: count() })
      .from(songs)
      .groupBy(songs.persianYear)
      .orderBy(desc(songs.persianYear)),
    db
      .select({ artist: songs.artist, count: count() })
      .from(songs)
      .where(ne(songs.artist, ""))
      .groupBy(songs.artist)
      .orderBy(desc(count()), asc(songs.artist))
      .limit(10),
  ]);

  return {
    totalSongs: totalRow[0]?.value ?? 0,
    scoreDistribution,
    releasesByYear,
    topArtists,
  };
}
