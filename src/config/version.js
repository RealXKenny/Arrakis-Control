const fs = require('node:fs');
const path = require('node:path');

const versionPath = path.join(__dirname, '..', '..', 'VERSION');

function getBotVersion() {
  return process.env.BOT_VERSION ?? fs.readFileSync(versionPath, 'utf8').trim();
}

module.exports = { getBotVersion };
