import { NextResponse } from 'next/server';

export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

export function unauthorizedResponse(
  error = 'Unauthorized',
  status = 401
) {
  return NextResponse.json(
    { ok: false, error },
    { status, headers: NO_STORE_HEADERS }
  );
}

export function getErrorMessage(error, fallback = 'Internal Server Error') {
  return error instanceof Error ? error.message : fallback;
}