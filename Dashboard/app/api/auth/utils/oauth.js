export function getDiscordOAuthConfig(env = process.env) {
  return {
    clientId: env.DISCORD_CLIENT_ID ?? env.CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET ?? env.CLIENT_SECRET,
    redirectUri: env.DISCORD_REDIRECT_URI,
    guildId: env.GUILD_ID,
    ownerRoleId: env.OWNER_ROLE_ID,
  };
}

export function createDiscordAuthorizationUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds.members.read',
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}