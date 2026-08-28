require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { validateEnvironment } = require('../src/utils/validateEnvironment');

validateEnvironment(['DISCORD_TOKEN', 'CLIENT_ID']);

const commandsPath = path.join(__dirname, '..', 'src', 'commands');
const commands = fs.readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))
  .map((file) => require(path.join(commandsPath, file)).data.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  console.log(`Deploying ${commands.length} application command(s)...`);
  await rest.put(route, { body: commands });
  console.log('Application commands deployed.');
}

deployCommands().catch((error) => {
  console.error('Unable to deploy application commands:', error);
  process.exitCode = 1;
});
