const fs = require('node:fs');
const path = require('node:path');

const rootPath = path.join(__dirname, '..', '..');
const version = fs.readFileSync(path.join(rootPath, 'VERSION'), 'utf8').trim();
const changelogRelease = loadChangelogRelease(version);
if (!changelogRelease)
  throw new Error(`CHANGELOG.json does not contain a release entry for version ${version}.`);
const notes = buildNotes({ version, changelogRelease });
const outputPath = process.argv[2];

if (outputPath) {
  fs.writeFileSync(outputPath, notes);
  console.log(`Detailed release notes written to ${outputPath}.`);
} else {
  process.stdout.write(notes);
}

function buildNotes({ version: releaseVersion, changelogRelease }) {
  const groups = new Map([
    ['Features', []],
    ['Fixes', []],
    ['Performance', []],
    ['Documentation', []],
    ['Refactoring', []],
    ['Maintenance', []],
    ['Other changes', []],
  ]);

  const changes = changelogRelease.changes.map((change) => ({
    subject: change.title ?? change.description ?? 'Unspecified change',
    body: change.details ?? '',
    type: change.type,
    hash: null,
  }));

  for (const change of changes)
    groups.get(change.type ? categoryFor(change.type) : categoryFor(change.subject)).push(change);

  const lines = [
    `# Arrakis Control v${releaseVersion}`,
    '',
    changelogRelease?.summary ?? null,
    changelogRelease?.date ? `Release date: ${changelogRelease.date}` : null,
    '',
    '## Docker image',
    '',
    '```bash',
    `docker pull realxkenny/arrakis-control:${releaseVersion}`,
    '```',
    '',
    '## Changes',
    '',
  ].filter((line) => line !== null);

  if (changes.length === 0) lines.push('No changes were recorded for this release.');
  for (const [category, categoryChanges] of groups) {
    if (categoryChanges.length === 0) continue;
    lines.push(`### ${category}`, '');
    for (const change of categoryChanges) {
      lines.push(`- ${change.subject}`);
      if (change.body) lines.push(`  ${change.body.replace(/\r?\n/g, '\n  ')}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function loadChangelogRelease(releaseVersion) {
  const changelogPath = path.join(rootPath, 'CHANGELOG.json');
  if (!fs.existsSync(changelogPath)) return null;

  try {
    const changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));
    return changelog.releases?.find((release) => release.version === releaseVersion) ?? null;
  } catch (error) {
    console.warn(`Unable to read CHANGELOG.json; using commit history instead: ${error.message}`);
    return null;
  }
}

function categoryFor(subject) {
  const type = subject.match(/^(\w+)(?:\(.+?\))?!?:/i)?.[1]?.toLowerCase() ?? subject.toLowerCase();
  return (
    {
      feat: 'Features',
      feature: 'Features',
      fix: 'Fixes',
      perf: 'Performance',
      docs: 'Documentation',
      refactor: 'Refactoring',
      chore: 'Maintenance',
      maintenance: 'Maintenance',
      build: 'Maintenance',
      ci: 'Maintenance',
      test: 'Maintenance',
    }[type] ?? 'Other changes'
  );
}
