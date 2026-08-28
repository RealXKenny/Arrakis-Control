const fs = require('node:fs');
const path = require('node:path');

const rootPath = path.join(__dirname, '..', '..');
const version = fs.readFileSync(path.join(rootPath, 'VERSION'), 'utf8').trim();
const packagePath = path.join(rootPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (packageJson.version !== version) {
  packageJson.version = version;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`Updated package.json to version ${version}.`);
} else {
  console.log(`package.json already uses version ${version}.`);
}
