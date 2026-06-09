import { NextResponse } from "next/server";
import { getDoc } from "@/lib/store";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const creds = await getDoc<{ username: string; password: string }>("credentials", {
      username: "admin",
      password: "admin123",
    });
    if (username === creds.username && password === creds.password) {
      const jar = await cookies();
      jar.set("admin_session", "1", {
        httpOnly: true, path: "/", sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
