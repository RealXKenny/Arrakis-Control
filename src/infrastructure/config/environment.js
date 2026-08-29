function loadEnvironment(requiredKeys = []) {
  require("dotenv").config({ quiet: true });

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingKeys.join(", ")}`,
    );
  }

  return Object.freeze({
    discordToken: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    duneConsoleUrl: process.env.CONSOLE_URL,
    advinApiKey: process.env.API_KEY,
    advinApiUrl: process.env.API_URL ?? "https://vps.advinservers.com",
    duneConsolePassword: process.env.CONSOLE_PASSWORD,
    duneDiscordAdapterToken: process.env.ADAPTER_TOKEN,
    duneDiscordLinkPanelChannelId:
      process.env.LINK_PANEL_CHANNEL_ID,
    duneDiscordBlueprintPanelChannelId:
      process.env.BLUEPRINT_PANEL_CHANNEL_ID,
    duneDiscordAuditChannelId: process.env.AUDIT_CHANNEL_ID,
    duneDiscordActivityLogChannelId: process.env.ACTIVITY_LOG_CHANNEL_ID,
    discordRolePanelChannelId: process.env.ROLE_PANEL_CHANNEL_ID,
    discordVerifyChannelId: process.env.VERIFY_CHANNEL_ID,
    discordRulesChannelId: process.env.RULES_CHANNEL_ID,
    discordServerInfoChannelId: process.env.SERVER_INFO_CHANNEL_ID,
    discordAnnouncementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,
    versionAnnouncementIntervalMinutes: Number(process.env.VERSION_ANNOUNCEMENT_INTERVAL_MINUTES ?? 5),
    logLevel: process.env.LOG_LEVEL ?? "INFO",
  });
}

module.exports = { loadEnvironment };
