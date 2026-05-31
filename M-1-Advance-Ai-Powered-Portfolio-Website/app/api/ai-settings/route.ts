import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/localDb";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const data = readJson<Record<string, string>>("ai-settings.json");
    // Strip secret keys from public response — only return non-sensitive fields
    const { assistantName, greeting, provider,
      openaiModel, geminiModel, claudeModel, openrouterModel } = data;
    return NextResponse.json({ assistantName, greeting, provider,
      openaiModel, geminiModel, claudeModel, openrouterModel });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// Admin-only: returns full settings including keys
export async function POST() {
  const jar = await cookies();
  if (!jar.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(readJson("ai-settings.json"));
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const jar = await cookies();
  if (!jar.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const current = readJson<Record<string, string>>("ai-settings.json");
    const updated = { ...current, ...body };
    writeJson("ai-settings.json", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
