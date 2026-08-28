const fs = require('node:fs');
const path = require('node:path');

function findJavaScriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const itemPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? findJavaScriptFiles(itemPath)
      : itemPath.endsWith('.js')
        ? [itemPath]
        : [];
  });
}

module.exports = { findJavaScriptFiles };
