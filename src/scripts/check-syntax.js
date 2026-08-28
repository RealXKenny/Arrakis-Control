const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createLogger } = require("../core/logger");
const { findJavaScriptFiles } = require("../loaders/fileLoader");

const logger = createLogger("SYNTAX");

for (const filePath of findJavaScriptFiles(path.join(__dirname, ".."))) {
  execFileSync(process.execPath, ["--check", filePath], { stdio: "inherit" });
}

logger.info("Syntax check passed.");
