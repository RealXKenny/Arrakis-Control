import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Dynamically query our active Discord credentials straight from the parent .env matrix
    const clientId = process.env.DISCORD_CLIENT_ID ?? process.env.CLIENT_ID;
    const port = Number(process.env.DASHBOARD_PORT ?? 8787);
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (!clientId) {
      console.error("Missing Discord Client ID configuration in environment variables.");
      return NextResponse.json({ error: 'Server misconfigured: Missing Client ID' }, { status: 500 });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds.members.read',
    });

    // Generate our precise Discord OAuth authorization endpoint link context target
    const discordAuthUrl =
      `https://discord.com/oauth2/authorize?${params.toString()}`;

    // Perform an immediate server-side HTTP 302 redirect to Discord's gateway
    return NextResponse.redirect(discordAuthUrl);

  } catch (error) {
    console.error('Error processing Discord OAuth login redirect route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
