import { NextResponse } from 'next/server';
import { createDiscordAuthorizationUrl, getDiscordOAuthConfig } from '../utils/oauth';

export async function GET() {
  try {
    const { clientId, redirectUri } = getDiscordOAuthConfig();

    if (!clientId) {
      console.error(
        'Missing Discord Client ID configuration in environment variables.'
      );

      return NextResponse.json(
        {
          error:
            'Server misconfigured: Missing Client ID',
        },
        { status: 500 }
      );
    }

    if (!redirectUri) {
      console.error(
        'Missing DISCORD_REDIRECT_URI configuration in environment variables.'
      );

      return NextResponse.json(
        {
          error:
            'Server misconfigured: Missing Discord redirect URI',
        },
        { status: 500 }
      );
    }

    const discordAuthUrl = createDiscordAuthorizationUrl(clientId, redirectUri);

    return NextResponse.redirect(discordAuthUrl);
  } catch (error) {
    console.error(
      'Error processing Discord OAuth login redirect route:',
      error
    );

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
