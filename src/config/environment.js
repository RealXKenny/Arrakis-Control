function loadEnvironment(requiredKeys = []) {
  require('dotenv').config();

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingKeys.join(', ')}`);
  }

  return Object.freeze({
    discordToken: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    duneConsoleUrl: process.env.DUNE_CONSOLE_URL,
    duneConsolePassword: process.env.DUNE_CONSOLE_PASSWORD,
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
  });
}

module.exports = { loadEnvironment };
