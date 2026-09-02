import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'dashboard_session';

export async function getDashboardSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionId
    ? global.dashboardSessions?.get(sessionId)
    : null;

  if (
    !sessionId ||
    !session ||
    !session.expiresAt ||
    session.expiresAt < Date.now()
  ) {
    return null;
  }

  return { session, sessionId };
}

export async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}