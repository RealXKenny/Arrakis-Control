const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DuneApi } = require('../api/DuneApi');
const { loadCommands } = require('../loaders/commandLoader');
const { loadEvents } = require('../loaders/eventLoader');
const { createLogger } = require('./logger');

function createBotApplication(config) {
  const logger = createLogger('BOT', config.logLevel);
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();
  client.duneApi = new DuneApi(config.duneConsoleUrl);

  loadCommands(client);
  loadEvents(client);

  let isShuttingDown = false;

  async function start() {
    await client.duneApi.login(config.duneConsolePassword);
    logger.info('Logged in to the Dune Console.');
    await client.login(config.discordToken);
  }

  async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`Received ${signal}; signing out of the Dune Console.`);

    try {
      await client.duneApi.logout();
      logger.info('Logged out of the Dune Console.');
    } catch (error) {
      logger.error('Unable to log out of the Dune Console.', error);
    } finally {
      client.destroy();
      process.exit(exitCode);
    }
  }

  return { start, shutdown };
}

module.exports = { createBotApplication };
