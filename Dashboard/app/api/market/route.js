import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getDuneClient } from '../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sessionId = (await cookies()).get('dashboard_session')?.value;
    const session = sessionId ? global.dashboardSessions?.get(sessionId) : null;
    if (!sessionId || !session || session.expiresAt < Date.now()) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = getDuneClient();
    const [stats, items, config, marketConfig] = await Promise.all([
      client.request('GET', '/api/exchange/stats'),
      client.request('GET', '/api/exchange/items?page=0&pageSize=100'),
      client.request('GET', '/api/exchange/config'),
      client.request('GET', '/api/exchange/market'),
    ]);

    const payload = { stats, items, config, marketConfig };
    try {
      const debugDirectory = path.join(process.cwd(), 'debug');
      await mkdir(debugDirectory, { recursive: true });
      await writeFile(
        path.join(debugDirectory, 'market-board-response.json'),
        JSON.stringify(payload, null, 2),
        { encoding: 'utf8', flag: 'wx' }
      );
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        console.warn('Unable to save market board debug snapshot:', error);
      }
    }

    return NextResponse.json({ ok: true, ...payload }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unable to load market data' }, { status: 502 });
  }
}
