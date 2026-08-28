require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/loaders/commandHandler');
const { loadEvents } = require('./handlers/loaders/eventHandler');
const { validateEnvironment } = require('./utils/environment/validateEnvironment');
const { DuneApi } = require('./api/DuneApi');

validateEnvironment(['DISCORD_TOKEN']);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// The API client is ready for use by future commands. It never logs in by itself.
if (process.env.DUNE_CONSOLE_URL) client.duneApi = new DuneApi(process.env.DUNE_CONSOLE_URL);

loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
