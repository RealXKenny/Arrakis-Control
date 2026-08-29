const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { loadEnvironment } = require('../infrastructure/config/environment');
const { createLogger } = require('../infrastructure/core/logger');
const { findJavaScriptFiles } = require('../infrastructure/loaders/fileLoader');

const config = loadEnvironment(['DISCORD_TOKEN', 'CLIENT_ID']);
const logger = createLogger('COMMAND DEPLOY', config.logLevel);

const commandsPath = path.join(__dirname, '..', 'app', 'commands');
const commands = findJavaScriptFiles(commandsPath).map((filePath) =>
  require(filePath).data.toJSON(),
);
const rest = new REST({ version: '10' }).setToken(config.discordToken);

async function deployCommands() {
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);

  logger.info(`Deploying ${commands.length} application command(s).`);
  await rest.put(route, { body: commands });
  logger.info('Application commands deployed.');
}

deployCommands().catch((error) => {
  logger.error('Unable to deploy application commands.', error);
  process.exitCode = 1;
});
