import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/localDb";

export async function GET() {
  try {
    const data = readJson("config.json");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const current = readJson<Record<string, unknown>>("config.json");
    const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
    writeJson("config.json", updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
