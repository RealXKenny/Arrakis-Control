import fs from "node:fs";
import path from "node:path";

interface PackageJson {
  version?: string;
}

const versionPaths = [
  path.join(__dirname, "..", "..", "VERSION"),
  path.join(process.cwd(), "VERSION"),
  path.join(__dirname, "..", "..", "VERSION"),
];

function getBotVersion(): string {
  const environmentVersion = process.env.BOT_VERSION?.trim();

  if (environmentVersion) {
    return environmentVersion;
  }

  const versionPath = versionPaths.find((candidate) => fs.existsSync(candidate));

  if (versionPath) {
    const version = fs.readFileSync(versionPath, "utf8").trim();

    if (version) {
      return version;
    }
  }

  const packageJsonPath = path.join(__dirname, "..", "..", "..", "package.json");

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;

  if (!packageJson.version) {
    throw new Error("Unable to determine the bot version: package.json does not contain a version.");
  }

  return packageJson.version;
}

export { getBotVersion };
