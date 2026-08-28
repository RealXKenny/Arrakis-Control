const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const itemPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(itemPath) : itemPath.endsWith('.js') ? [itemPath] : [];
  });
}

for (const file of [...filesIn(path.join(__dirname, '..', 'src')), ...filesIn(__dirname)]) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

console.log('Syntax check passed.');
