const fs = require('node:fs');
const path = require('node:path');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.execute) {
      console.warn(`Skipping ${file}: commands must export data and execute.`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

module.exports = { loadCommands };
