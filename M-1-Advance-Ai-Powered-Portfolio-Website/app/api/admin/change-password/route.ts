import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/localDb";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!jar.get("admin_session")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { newPassword } = await req.json();
    const creds = readJson<{ username: string; password: string }>("credentials.json");
    writeJson("credentials.json", { ...creds, password: newPassword });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
