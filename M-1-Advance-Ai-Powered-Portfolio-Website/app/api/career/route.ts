import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/localDb";

export async function GET() {
  try {
    return NextResponse.json(readJson("career.json"));
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    writeJson("career.json", body);
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
