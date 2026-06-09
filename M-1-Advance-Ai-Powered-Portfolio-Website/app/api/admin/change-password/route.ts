import { NextResponse } from "next/server";
import { getDoc, setDoc } from "@/lib/store";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!jar.get("admin_session")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { newPassword, username } = await req.json();
    const creds = await getDoc<{ username: string; password: string }>("credentials", {
      username: "admin",
      password: "admin123",
    });
    await setDoc("credentials", {
      username: username || creds.username,
      password: newPassword || creds.password,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
