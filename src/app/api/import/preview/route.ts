import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-guard";
import { parseSongCsv } from "@/lib/import/csv";

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "CSV file must be <= 5MB" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = parseSongCsv(text);

  return NextResponse.json({
    fileName: file.name,
    totalRows: parsed.validRows.length + parsed.errors.length,
    validCount: parsed.validRows.length,
    errorCount: parsed.errors.length,
    errors: parsed.errors,
    previewRows: parsed.validRows.slice(0, 10),
    validRows: parsed.validRows,
  });
}
