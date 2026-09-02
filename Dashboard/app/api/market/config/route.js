import { NextResponse } from 'next/server';
import { getDuneClient } from '../../dune/client';
import { extractBuybackPercent } from '../utils/market';
import { getDashboardSession } from '../../_utils/session';
import { unauthorizedResponse, NO_STORE_HEADERS, getErrorMessage } from '../../_utils/responses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await getDashboardSession())) {
    return unauthorizedResponse();
  }

  try {
    const market = await getDuneClient().request('GET', '/api/exchange/market');
    const buybackPercent = extractBuybackPercent(market);
    return NextResponse.json({ ok: true, buybackPercent }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error, 'Unable to load market config') }, { status: 502 });
  }
}
