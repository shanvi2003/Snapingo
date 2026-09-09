import "server-only";
import { NextResponse } from "next/server";

// Every /api/v1/* route replies in this one shape, success or failure, so
// the Android app (or any other client) only ever has to check `ok` once
// instead of guessing a different error shape per endpoint.
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
