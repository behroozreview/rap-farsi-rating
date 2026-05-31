import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-guard";
import { deleteImportedSongs } from "@/lib/songs";

export async function DELETE() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedCount = await deleteImportedSongs();
  return NextResponse.json({ deletedCount });
}
