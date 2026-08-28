const path = require('node:path');
const { findJavaScriptFiles } = require('./fileLoader');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', '..', 'events');

  for (const filePath of findJavaScriptFiles(eventsPath)) {
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

module.exports = { loadEvents };
