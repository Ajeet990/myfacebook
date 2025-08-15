import { NextResponse } from "next/server";

export function sendResponse({ success = true, message = "", data = null, status = 200 }) {
  return NextResponse.json(
    { success, message, data },
    { status }
  );
}
