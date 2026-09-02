import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionId =
      cookieStore.get('dashboard_session')?.value;

    // Remove the server-side session.
    if (sessionId && global.dashboardSessions) {
      global.dashboardSessions.delete(sessionId);
    }

    // Clear the authentication cookie.
    cookieStore.set('dashboard_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });

    // Always redirect to the public production application URL.
    const appUrl =
      process.env.APP_URL || 'http://localhost:3000';

    return NextResponse.redirect(
      new URL('/', appUrl)
    );
  } catch (error) {
    console.error('Logout error:', error);

    const appUrl =
      process.env.APP_URL || 'http://localhost:3000';

    return NextResponse.redirect(
      new URL('/', appUrl)
    );
  }
}