import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  // H-6 FIX: destroySession now blacklists the token via Redis before clearing cookie
  await destroySession();
  return NextResponse.json({ success: true });
}
