import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { getDiscordOAuthConfig } from '../utils/oauth';

// Load .env from the project/parent directory when available.
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

// In-memory session store.
if (!global.dashboardSessions) {
  global.dashboardSessions = new Map();
}

const sessions = global.dashboardSessions;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    // User denied/cancelled Discord authorization.
    if (oauthError) {
      console.error('Discord OAuth error received during callback');

      const appUrl =
        process.env.APP_URL || new URL(request.url).origin;

      return NextResponse.redirect(
        new URL('/?error=discord_denied', appUrl)
      );
    }

    if (!code) {
      console.error('Discord callback missing authorization code');

      return NextResponse.json(
        { error: 'Missing Discord authorization code' },
        { status: 400 }
      );
    }

    const {
      clientId,
      clientSecret,
      guildId,
      ownerRoleId,
    } = getDiscordOAuthConfig();

    // Use the exact same redirect URI configured for Discord OAuth.
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    // Public application URL used for redirects after authentication.
    const appUrl =
      process.env.APP_URL || new URL(request.url).origin;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Discord OAuth configuration:', {
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
        redirectUri,
      });

      return NextResponse.json(
        {
          error:
            'Server misconfigured: Missing Discord OAuth credentials',
        },
        { status: 500 }
      );
    }

    if (!guildId) {
      console.error('Missing GUILD_ID');

      return NextResponse.json(
        { error: 'Server misconfigured: Missing GUILD_ID' },
        { status: 500 }
      );
    }

    // Exchange Discord authorization code for an access token.
    const bodyParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      'https://discord.com/api/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams,
        cache: 'no-store',
      }
    );

    const responseText = await tokenResponse.text();

    let tokenData;

    try {
      tokenData = JSON.parse(responseText);
    } catch {
      console.error(
        'Discord returned non-JSON token response:',
        responseText
      );

      return NextResponse.json(
        {
          error:
            'Invalid response from Discord token endpoint',
        },
        { status: 502 }
      );
    }

    if (!tokenResponse.ok) {
      console.error('Discord OAuth token exchange failed:', {
        status: tokenResponse.status,
        response: tokenData,
        redirectUri,
      });

      return NextResponse.json(
        {
          error: 'OAuth2 code validation failure.',
          discord: tokenData,
        },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      console.error(
        'Discord token response contained no access token'
      );

      return NextResponse.json(
        {
          error:
            'Discord did not return an access token',
        },
        { status: 400 }
      );
    }

    // Get the authenticated Discord user.
    const userResponse = await fetch(
      'https://discord.com/api/users/@me',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: 'no-store',
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Discord user lookup failed:', {
        status: userResponse.status,
        response: userData,
      });

      return NextResponse.json(
        { error: 'Failed to retrieve Discord user' },
        { status: 400 }
      );
    }

    // Get the user's membership in your Discord guild.
    const memberUrl =
      `https://discord.com/api/guilds/${guildId}/members/@me`;

    const memberResponse = await fetch(memberUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: 'no-store',
    });

    let memberData = {};

    if (memberResponse.ok) {
      memberData = await memberResponse.json();
    } else {

    }

    const rolesArray = Array.isArray(memberData.roles)
      ? memberData.roles
      : [];

    const isOwner =
      Boolean(ownerRoleId) &&
      rolesArray.includes(ownerRoleId);

    // Generate a cryptographically random application session ID.
    const sessionId = crypto.randomBytes(32).toString('hex');

    sessions.set(sessionId, {
      user: userData,
      guildId,
      roleIds: rolesArray,
      isOwner,
      expiresAt: Date.now() + 86400000,
    });

    // Store only the random session ID in the browser.
    const cookieStore = await cookies();

    cookieStore.set('dashboard_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    // Owners go to dashboard; other authenticated members go to portal.
    return NextResponse.redirect(
      new URL(
        isOwner ? '/dashboard' : '/portal',
        appUrl
      )
    );
  } catch (error) {
    console.error(
      'Internal Discord OAuth callback error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Internal server token processing error',
      },
      { status: 500 }
    );
  }
}