function loadEnvironment(requiredKeys = []) {
  require('dotenv').config();

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingKeys.join(', ')}`);
  }

  return Object.freeze({
    discordToken: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    guildId: process.env.GUILD_ID,
    duneConsoleUrl: process.env.DUNE_CONSOLE_URL,
    advinApiKey: process.env.ADVIN_API_KEY,
    advinApiUrl: process.env.ADVIN_API_URL ?? 'https://vps.advinservers.com',
    duneConsolePassword: process.env.DUNE_CONSOLE_PASSWORD,
    duneDiscordAdapterToken: process.env.DUNE_DISCORD_ADAPTER_TOKEN,
    duneDiscordLinkPanelChannelId: process.env.DUNE_DISCORD_LINK_PANEL_CHANNEL_ID,
    duneDiscordBlueprintPanelChannelId: process.env.DUNE_DISCORD_BLUEPRINT_PANEL_CHANNEL_ID,
    duneDiscordAuditChannelId: process.env.DUNE_DISCORD_AUDIT_CHANNEL_ID,
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
    dashboardPort: Number(process.env.DASHBOARD_PORT ?? 8787),
    dashboardHost: process.env.DASHBOARD_HOST ?? '0.0.0.0',
    dashboardPublicUrl: process.env.DASHBOARD_PUBLIC_URL,
  });
}

module.exports = { loadEnvironment };
