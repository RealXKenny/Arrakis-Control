import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

let currentDir = process.cwd();
let envPath = null;

while (currentDir && currentDir !== path.parse(currentDir).root) {
  const checkPath = path.join(currentDir, '.env');

  if (fs.existsSync(checkPath)) {
    envPath = checkPath;
    break;
  }

  currentDir = path.dirname(currentDir);
}

if (envPath) {
  dotenv.config({ path: envPath });
}

if (!global.dashboardSessions) {
  global.dashboardSessions = new Map();
}

const sessions = global.dashboardSessions;

export async function GET(request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const clientId =
      process.env.DISCORD_CLIENT_ID ?? process.env.CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const guildId = process.env.GUILD_ID;
    const ownerRoleId = process.env.OWNER_ROLE_ID;
    const redirectUri = `${origin}/auth/callback`;

    const bodyParams = new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      'https://discord.com/api/oauth2/token',
      {
        method: 'POST',
        body: bodyParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const responseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'OAuth2 code validation failure.' },
        { status: 400 }
      );
    }

    const tokenData = JSON.parse(responseText);

    const userResponse = await fetch(
      'https://discord.com/api/users/@me',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    const memberUrl = `https://discord.com/api/guilds/${guildId}/members/@me`;

    const memberResponse = await fetch(memberUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const memberData = memberResponse.ok
      ? await memberResponse.json()
      : {};

    const rolesArray = Array.isArray(memberData.roles)
      ? memberData.roles
      : [];

    const isOwner = rolesArray.includes(ownerRoleId);

    const sessionId = crypto.randomBytes(32).toString('hex');

    sessions.set(sessionId, {
      user: userData,
      guildId,
      roleIds: rolesArray,
      isOwner,
      expiresAt: Date.now() + 86400000,
    });

    const cookieStore = await cookies();

    cookieStore.set('dashboard_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return NextResponse.redirect(
      new URL(isOwner ? '/dashboard' : '/portal', request.url)
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server token processing error' },
      { status: 500 }
    );
  }
}