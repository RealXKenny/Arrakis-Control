const path = require('node:path');
const { findJavaScriptFiles } = require('./fileLoader');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');

  for (const filePath of findJavaScriptFiles(eventsPath)) {
    const event = require(filePath);
    const register = event.once ? client.once.bind(client) : client.on.bind(client);
    register(event.name, (...args) => event.execute(...args));
  }
}

module.exports = { loadEvents };
