require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/loaders/commandHandler');
const { loadEvents } = require('./handlers/loaders/eventHandler');
const { validateEnvironment } = require('./utils/environment/validateEnvironment');
const { DuneApi } = require('./api/DuneApi');

validateEnvironment(['DISCORD_TOKEN', 'DUNE_CONSOLE_URL', 'DUNE_CONSOLE_PASSWORD']);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.duneApi = new DuneApi(process.env.DUNE_CONSOLE_URL);

loadCommands(client);
loadEvents(client);

let isShuttingDown = false;

async function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}; signing out of the Dune Console...`);

  try {
    await client.duneApi.logout();
    console.log('Logged out of the Dune Console.');
  } catch (error) {
    console.error('Unable to log out of the Dune Console:', error.message);
  } finally {
    client.destroy();
    process.exit(exitCode);
  }
}

async function start() {
  await client.duneApi.login(process.env.DUNE_CONSOLE_PASSWORD);
  console.log('Logged in to the Dune Console.');
  await client.login(process.env.DISCORD_TOKEN);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGBREAK', () => shutdown('SIGBREAK'));

start().catch((error) => {
  console.error('Unable to start the bot:', error.message);
  shutdown('startup failure', 1);
});
