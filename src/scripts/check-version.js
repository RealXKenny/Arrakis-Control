const fs = require('node:fs');
const path = require('node:path');

const versionPath = path.join(__dirname, '..', '..', 'VERSION');
const version = fs.readFileSync(versionPath, 'utf8').trim();
const semanticVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

if (!semanticVersion.test(version)) {
  throw new Error('VERSION must contain one valid semantic version, for example: 1.2.3');
}

console.log(`Version ${version} is valid.`);
