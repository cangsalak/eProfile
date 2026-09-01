import { NextResponse } from 'next/server';

/**
 * Standardized API error response helper.
 * In production, suppresses internal error details to prevent information leakage.
 * In development, returns full error details for debugging.
 */
export function apiError(
  message: string,
  status: number = 500,
  internalError?: unknown
): NextResponse {
  if (process.env.NODE_ENV !== 'production' && internalError) {
    console.error(`[API Error ${status}] ${message}`, internalError);
    return NextResponse.json({
      error: message,
      details: internalError instanceof Error ? internalError.message : String(internalError),
    }, { status });
  }

  // In production: log but don't expose internals
  if (internalError) {
    console.error(`[API Error ${status}] ${message}`);
  }

  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
