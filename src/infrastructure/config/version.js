const fs = require('node:fs');
const path = require('node:path');

const versionPaths = [
  path.join(__dirname, '..', '..', '..', 'VERSION'),
  path.join(process.cwd(), 'VERSION'),
  path.join(__dirname, '..', '..', 'VERSION'),
];

function getBotVersion() {
  if (process.env.BOT_VERSION) return process.env.BOT_VERSION;
  const versionPath = versionPaths.find((candidate) => fs.existsSync(candidate));
  if (versionPath) return fs.readFileSync(versionPath, 'utf8').trim();
  return require(path.join(__dirname, '..', '..', '..', 'package.json')).version;
}

module.exports = { getBotVersion };
