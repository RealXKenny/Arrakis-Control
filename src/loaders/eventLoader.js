const path = require("node:path");
const { findJavaScriptFiles } = require("./fileLoader");
const { createLogger } = require("../core/logger");

const logger = createLogger("EVENTS");

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "..", "events");
  let loaded = 0;

  for (const filePath of findJavaScriptFiles(eventsPath)) {
    const event = require(filePath);
    if (!event.name || !event.execute) {
      logger.warn(`Skipped invalid event module: ${filePath}`);
      continue;
    }

    const register = event.once ? client.once.bind(client) : client.on.bind(client);
    register(event.name, (...args) => event.execute(...args));
    loaded += 1;
  }

  logger.info(`Loaded ${loaded} event handler${loaded === 1 ? "" : "s"}.`);
  return { loaded };
}

module.exports = { loadEvents };
