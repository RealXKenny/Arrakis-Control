
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dashboard_session')?.value;

    // Validate that the caller has an active session in the global registry
    const session = global.dashboardSessions?.get(sessionId);
    if (!session || !session.isOwner) {
      return NextResponse.json({ error: 'Unauthorized Administrative Action Required' }, { status: 401 });
    }

    console.log("⚠️ Administrative bot restart requested via Next.js control center.");

    // Trigger immediate graceful process termination. Your Docker restart policy 
    // ("unless-stopped") will spin up a fresh instance instantly.
    setTimeout(() => {
      process.exit(0);
    }, 1000);

    return NextResponse.json({ ok: true, message: "Restart signal transmitted successfully" }, { status: 200 });

  } catch (error) {
    console.error('Error executing bot orchestration control route:', error);
    return NextResponse.json({ error: 'Internal server control execution error' }, { status: 500 });
  }
}