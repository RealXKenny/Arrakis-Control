import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getDuneClient } from '../../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request, { params }) {
  try {
    const sessionId = (await cookies()).get('dashboard_session')?.value;
    const session = sessionId
      ? global.dashboardSessions?.get(sessionId)
      : null;

    if (!sessionId || !session || session.expiresAt < Date.now()) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const baseId = (await params)?.baseId;
    if (!baseId) {
      return NextResponse.json({ ok: false, error: 'Missing base ID' }, { status: 400 });
    }

    const blueprint = await getDuneClient().request(
      'GET',
      `/api/bases/${encodeURIComponent(baseId)}/export`
    );

    return new NextResponse(JSON.stringify(blueprint, null, 2), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="base-${String(baseId).replace(/[^a-zA-Z0-9_-]/g, '_')}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unable to export base' },
      { status: 502 }
    );
  }
}
