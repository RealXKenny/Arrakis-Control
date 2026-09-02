import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDuneClient } from '../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const sessionId = (await cookies()).get('dashboard_session')?.value;
  const session = sessionId ? global.dashboardSessions?.get(sessionId) : null;
  if (!sessionId || !session || session.expiresAt < Date.now()) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const market = await getDuneClient().request('GET', '/api/exchange/market');
    const buybackPercent = market?.buyback?.buybackPercent
      ?? market?.buybackSchedule?.buybackPercent
      ?? market?.schedule?.buybackPercent
      ?? market?.buybackPercent
      ?? null;
    return NextResponse.json({ ok: true, buybackPercent }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unable to load market config' }, { status: 502 });
  }
}
