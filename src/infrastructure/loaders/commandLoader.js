const path = require('node:path');
const { createLogger } = require('../core/logger');
const { findJavaScriptFiles } = require('./fileLoader');

const logger = createLogger('COMMANDS');

function loadCommands(client) {
  // Commands are discovered recursively so adding a command never requires a central registry edit.
  const commandsPath = path.join(__dirname, '..', '..', 'app', 'commands');
  let loaded = 0;
  let skipped = 0;

  for (const filePath of findJavaScriptFiles(commandsPath)) {
    const command = require(filePath);
    if (!command.data || !command.execute) {
      logger.warn(`Skipped invalid command module: ${filePath}`);
      skipped += 1;
      continue;
    }

    if (client.commands.has(command.data.name)) {
      logger.warn(`Skipped duplicate command: /${command.data.name}.`);
      skipped += 1;
      continue;
    }

    client.commands.set(command.data.name, command);
    loaded += 1;
  }

  logger.info(
    `Loaded ${loaded} command${loaded === 1 ? '' : 's'}${skipped ? `; skipped ${skipped}` : ''}.`,
  );
  return { loaded, skipped };
}

function reloadCommands(client) {
  const commandsPath = path.join(__dirname, '..', '..', 'app', 'commands');
  for (const filePath of findJavaScriptFiles(commandsPath))
    delete require.cache[require.resolve(filePath)];
  client.commands.clear();
  return loadCommands(client);
}

module.exports = { loadCommands, reloadCommands };
