const { existsSync } = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const frontend = path.join(__dirname, "..", "dashboard", "frontend");
const command = process.platform === "win32" ? "npm.cmd" : "npm";
const options = { cwd: frontend, stdio: "inherit", shell: process.platform === "win32" };
if (!existsSync(path.join(frontend, "package.json"))) process.exit(0);
execFileSync(command, ["install", "--no-audit", "--no-fund"], options);
execFileSync(command, ["run", "build"], options);
