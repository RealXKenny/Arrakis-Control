import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId =
      process.env.DISCORD_CLIENT_ID ?? process.env.CLIENT_ID;

    const redirectUri = process.env.DISCORD_REDIRECT_URI;

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

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds.members.read',
    });

    const discordAuthUrl =
      `https://discord.com/oauth2/authorize?${params.toString()}`;

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
