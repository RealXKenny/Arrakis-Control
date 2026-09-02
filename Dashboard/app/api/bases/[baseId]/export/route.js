import { NextResponse } from 'next/server';

import { getDuneClient } from '../../../dune/client';
import { getDashboardSession } from '../../../_utils/session';
import { unauthorizedResponse, getErrorMessage } from '../../../_utils/responses';
import { createBlueprintDownload } from '../../utils/export';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request, { params }) {
  try {
    if (!(await getDashboardSession())) {
      return unauthorizedResponse();
    }

    const baseId = (await params)?.baseId;
    if (!baseId) {
      return NextResponse.json({ ok: false, error: 'Missing base ID' }, { status: 400 });
    }

    const blueprint = await getDuneClient().request(
      'GET',
      `/api/bases/${encodeURIComponent(baseId)}/export`
    );

    const download = createBlueprintDownload(blueprint, baseId);
    return new NextResponse(download.body, {
      status: 200,
      headers: download.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error, 'Unable to export base') },
      { status: 502 }
    );
  }
}
