import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dashboard_session')?.value;

    // Remove the server-side session
    if (sessionId && global.dashboardSessions) {
      global.dashboardSessions.delete(sessionId);
    }

    // Clear the authentication cookie
    cookieStore.set('dashboard_session', '', {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.redirect(new URL('/', request.url));
  }
}