import { NextResponse } from "next/server";
import { getDoc, setDoc } from "@/lib/store";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const EMPTY = { title: "Beyond Code", intro: "", items: [] };

export async function GET() {
  try { return NextResponse.json(await getDoc("highlights", EMPTY)); }
  catch { return NextResponse.json(EMPTY, { status: 200 }); }
}
export async function PUT(req: Request) {
  const jar = await cookies();
  if (!jar.get("admin_session")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const body = await req.json(); await setDoc("highlights", body); return NextResponse.json(body); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
