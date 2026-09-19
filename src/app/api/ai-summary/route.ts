import { NextResponse } from "next/server";
// Retired unused, unauthenticated paid AI proxy. Core features do not use AI.
export function GET() {
  return NextResponse.json({ available: false, reason: "disabled" });
}
export function POST() {
  return NextResponse.json({ available: false, reason: "disabled", note: "Use the linked official policy source." }, { status: 410 });
}
