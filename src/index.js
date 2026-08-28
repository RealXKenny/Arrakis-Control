require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/loaders/commandHandler');
const { loadEvents } = require('./handlers/loaders/eventHandler');
const { validateEnvironment } = require('./utils/environment/validateEnvironment');

validateEnvironment(['DISCORD_TOKEN']);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
