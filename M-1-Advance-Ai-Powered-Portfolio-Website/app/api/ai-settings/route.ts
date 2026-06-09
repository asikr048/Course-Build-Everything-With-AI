import { NextResponse } from "next/server";
import { getDoc, patchDoc } from "@/lib/store";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  provider: "gemini",
  openaiKey: "", openaiModel: "gpt-4.1-mini",
  geminiKey: "", geminiModel: "gemini-2.5-flash",
  claudeKey: "", claudeModel: "claude-haiku-4-5-20251001",
  openrouterKey: "", openrouterModel: "meta-llama/llama-3.1-8b-instruct:free",
  assistantName: "Portfolio Assistant",
  greeting: "Hi! I'm here to answer any questions about this portfolio. Ask me anything!",
};

// Public: non-sensitive fields only (no API keys).
export async function GET() {
  try {
    const data = await getDoc<Record<string, string>>("ai-settings", DEFAULTS);
    const { assistantName, greeting, provider,
      openaiModel, geminiModel, claudeModel, openrouterModel } = data;
    return NextResponse.json({ assistantName, greeting, provider,
      openaiModel, geminiModel, claudeModel, openrouterModel });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

// Admin-only: full settings including keys.
export async function POST() {
  const jar = await cookies();
  if (!jar.get("admin_session")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getDoc("ai-settings", DEFAULTS));
  } catch {
    return NextResponse.json(DEFAULTS, { status: 200 });
  }
}

export async function PUT(req: Request) {
  const jar = await cookies();
  if (!jar.get("admin_session")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as Record<string, string>;
    // Don't let an empty key field wipe a previously saved key.
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k.endsWith("Key") && (v === "" || v == null)) continue;
      patch[k] = v;
    }
    const updated = await patchDoc<Record<string, string>>("ai-settings", patch);
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), provider: updated.provider });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
