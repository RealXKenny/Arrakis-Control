const fs = require("node:fs");
const path = require("node:path");

const rootPath = path.join(__dirname, "..", "..");
const versionPath = path.join(rootPath, "VERSION");
const packagePath = path.join(rootPath, "package.json");
const changelogPath = path.join(rootPath, "CHANGELOG.json");
const semanticVersion =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const version = fs.readFileSync(versionPath, "utf8").trim();
const command = process.argv[2] ?? "check";

validateVersion();

if (command === "check") {
  console.log(`Version ${version} is valid.`);
} else if (command === "sync") {
  syncPackageVersion();
} else if (command === "notes") {
  writeReleaseNotes();
} else {
  throw new Error(`Unknown version command: ${command}`);
}

function validateVersion() {
  if (!semanticVersion.test(version)) {
    throw new Error(
      "VERSION must contain one valid semantic version, for example: 1.2.3",
    );
  }
}

function syncPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (packageJson.version === version) {
    console.log(`package.json already uses version ${version}.`);
    return;
  }

  packageJson.version = version;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`Updated package.json to version ${version}.`);
}

function writeReleaseNotes() {
  const changelog = JSON.parse(fs.readFileSync(changelogPath, "utf8"));
  const release = changelog.releases?.find((entry) => entry.version === version);

  if (!release) {
    throw new Error(`CHANGELOG.json has no release entry for version ${version}.`);
  }

  const groups = new Map([
    ["Features", []],
    ["Fixes", []],
    ["Performance", []],
    ["Documentation", []],
    ["Refactoring", []],
    ["Maintenance", []],
    ["Other changes", []],
  ]);

  for (const change of release.changes ?? []) {
    groups.get(categoryFor(change.type)).push(change);
  }

  const lines = [
    `# Arrakis Control v${version}`,
    "",
    release.summary ?? "",
    release.date ? `Release date: ${release.date}` : "",
    "",
    "## Docker image",
    "",
    "```bash",
    `docker pull realxkenny/arrakis-control:${version}`,
    "```",
    "",
    "## Changes",
    "",
  ];

  for (const [category, changes] of groups) {
    if (changes.length === 0) continue;
    lines.push(`### ${category}`, "");
    for (const change of changes) {
      lines.push(`- ${change.title ?? change.description ?? "Unspecified change"}`);
      if (change.details) lines.push(`  ${change.details}`);
    }
    lines.push("");
  }

  const notes = `${lines.join("\n")}\n`;
  const outputPath = process.argv[3];

  if (outputPath) {
    fs.writeFileSync(outputPath, notes);
    console.log(`Release notes written to ${outputPath}.`);
  } else {
    process.stdout.write(notes);
  }
}

function categoryFor(type = "") {
  return (
    {
      feat: "Features",
      feature: "Features",
      fix: "Fixes",
      perf: "Performance",
      docs: "Documentation",
      refactor: "Refactoring",
      chore: "Maintenance",
      maintenance: "Maintenance",
      build: "Maintenance",
      ci: "Maintenance",
      test: "Maintenance",
    }[type.toLowerCase()] ?? "Other changes"
  );
}
