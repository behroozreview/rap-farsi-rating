import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-guard";
import { parseSongCsv, parseSongSpreadsheetText } from "@/lib/import/csv";

export async function POST(request: NextRequest) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let parsed;
  let fileName = "spreadsheet_paste";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const pastedText = typeof body?.pastedText === "string" ? body.pastedText : "";

    if (!pastedText.trim()) {
      return NextResponse.json({ error: "Missing pasted rows" }, { status: 400 });
    }

    parsed = parseSongSpreadsheetText(pastedText);
    fileName = typeof body?.fileName === "string" && body.fileName.trim() ? body.fileName.trim() : "spreadsheet_paste";
  } else {
    const formData = await request.formData();
    const file = formData.get("file");
    const pastedText = formData.get("pastedText");

    if (typeof pastedText === "string" && pastedText.trim()) {
      parsed = parseSongSpreadsheetText(pastedText);
      fileName = "spreadsheet_paste";
    } else {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing CSV file or pasted rows" }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "CSV file must be <= 5MB" }, { status: 400 });
      }

      const text = await file.text();
      parsed = parseSongCsv(text);
      fileName = file.name;
    }
  }

  return NextResponse.json({
    fileName,
    totalRows: parsed.validRows.length + parsed.errors.length,
    validCount: parsed.validRows.length,
    errorCount: parsed.errors.length,
    errors: parsed.errors,
    previewRows: parsed.validRows.slice(0, 10),
    validRows: parsed.validRows,
  });
}
