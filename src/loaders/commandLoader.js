const path = require('node:path');
const { createLogger } = require('../core/logger');
const { findJavaScriptFiles } = require('./fileLoader');

const logger = createLogger('COMMANDS');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');

  for (const filePath of findJavaScriptFiles(commandsPath)) {
    const command = require(filePath);
    if (!command.data || !command.execute) {
      logger.warn(`Skipped invalid command module: ${filePath}`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

module.exports = { loadCommands };
