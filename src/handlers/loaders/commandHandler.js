const path = require('node:path');
const { findJavaScriptFiles } = require('./fileLoader');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', '..', 'commands');

  for (const filePath of findJavaScriptFiles(commandsPath)) {
    const command = require(filePath);
    if (!command.data || !command.execute) {
      console.warn(`Skipping ${filePath}: commands must export data and execute.`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

module.exports = { loadCommands };
