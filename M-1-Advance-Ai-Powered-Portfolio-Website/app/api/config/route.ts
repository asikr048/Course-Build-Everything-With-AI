import { NextResponse } from "next/server";
import { getDoc, setDoc } from "@/lib/store";
import { withDefaults, type SiteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDoc<Partial<SiteConfig>>("config");
    return NextResponse.json(withDefaults(data));
  } catch {
    return NextResponse.json(withDefaults(null), { status: 200 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const current = await getDoc<Partial<SiteConfig>>("config");
    const updated = { ...withDefaults(current), ...body, updatedAt: new Date().toISOString() };
    await setDoc("config", updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
