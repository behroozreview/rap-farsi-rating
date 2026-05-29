import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { importLogs, songs } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-guard";
import { csvSongSchema } from "@/lib/validation/song";

const importPayloadSchema = csvSongSchema.array().min(1);

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rowsParse = importPayloadSchema.safeParse(body.rows);

  if (!rowsParse.success) {
    return NextResponse.json(
      { error: "Invalid import rows", details: rowsParse.error.flatten() },
      { status: 400 }
    );
  }

  const db = getDb();
  const rows = rowsParse.data;

  const errors: Array<{ row: number; error: string }> = [];
  let importedCount = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    const existing = await db
      .select({ id: songs.id })
      .from(songs)
      .where(
        and(
          eq(songs.title, row.title),
          eq(songs.artist, row.artist ?? ""),
          eq(songs.persianYear, row.persianYear)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      errors.push({ row: i + 2, error: "Duplicate title + artist + year" });
      continue;
    }

    await db.insert(songs).values({
      title: row.title,
      artist: row.artist ?? "",
      url: row.url,
      rating: row.rating,
      persianYear: row.persianYear,
      importedFrom: body.fileName ?? "csv_import",
    });

    importedCount += 1;
  }

  await db.insert(importLogs).values({
    fileName: body.fileName ?? "csv_import",
    importedCount,
    failedCount: errors.length,
    errors,
  });

  return NextResponse.json({
    importedCount,
    failedCount: errors.length,
    errors,
  });
}
