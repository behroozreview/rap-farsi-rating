import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-guard";
import { createSong, listSongs } from "@/lib/songs";
import { songSchema } from "@/lib/validation/song";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const yearRaw = searchParams.get("year");
  const ratingRaw = searchParams.get("rating");

  const year = yearRaw === "all" ? undefined : yearRaw ? Number(yearRaw) : undefined;
  const rating = ratingRaw ? Number(ratingRaw) : undefined;

  const songs = await listSongs({ q, year, rating });
  return NextResponse.json({ songs });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = songSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const song = await createSong(parsed.data, "manual");
  return NextResponse.json({ song }, { status: 201 });
}
