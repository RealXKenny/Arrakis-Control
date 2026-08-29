const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createLogger } = require('../infrastructure/core/logger');
const { findJavaScriptFiles } = require('../infrastructure/loaders/fileLoader');

const logger = createLogger('SYNTAX');

for (const filePath of findJavaScriptFiles(path.join(__dirname, '..'))) {
  execFileSync(process.execPath, ['--check', filePath], { stdio: 'inherit' });
}

logger.info('Syntax check passed.');
