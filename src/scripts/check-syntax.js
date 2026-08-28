const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { findJavaScriptFiles } = require('../handlers/loaders/fileLoader');

for (const filePath of findJavaScriptFiles(path.join(__dirname, '..'))) {
  execFileSync(process.execPath, ['--check', filePath], { stdio: 'inherit' });
}

console.log('Syntax check passed.');
