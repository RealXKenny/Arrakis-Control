const path = require('node:path');
const { createLogger } = require('../core/logger');
const { findJavaScriptFiles } = require('./fileLoader');

const logger = createLogger('COMPONENTS');
const handlerTypes = Object.freeze([
  ['buttons', 'buttons'],
  ['selectMenus', 'selectMenus'],
  ['modals', 'modals'],
]);

function loadComponentHandlers(client) {
  let loaded = 0;
  let skipped = 0;

  for (const [directory, collectionName] of handlerTypes) {
    const handlersPath = path.join(__dirname, '..', 'components', directory);
    for (const filePath of findJavaScriptFiles(handlersPath)) {
      const handler = require(filePath);
      if (!handler.customId || !handler.execute) {
        logger.warn(`Skipped invalid ${directory} handler: ${filePath}`);
        skipped += 1;
        continue;
      }

      client[collectionName].set(handler.customId, handler);
      loaded += 1;
    }
  }

  logger.info(`Loaded ${loaded} component handler${loaded === 1 ? '' : 's'}${skipped ? `; skipped ${skipped}` : ''}.`);
  return { loaded, skipped };
}

module.exports = { loadComponentHandlers };
