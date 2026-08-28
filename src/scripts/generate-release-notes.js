const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootPath = path.join(__dirname, '..', '..');
const version = fs.readFileSync(path.join(rootPath, 'VERSION'), 'utf8').trim();
const currentTag = `v${version}`;
const previousTag = findPreviousTag();
const range = previousTag ? `${previousTag}..HEAD` : 'HEAD';
const commits = getCommits(range).filter((commit) => !commit.subject.startsWith('chore: sync package version'));
const notes = buildNotes({ version, currentTag, previousTag, commits, range });
const outputPath = process.argv[2];

if (outputPath) {
  fs.writeFileSync(outputPath, notes);
  console.log(`Detailed release notes written to ${outputPath}.`);
} else {
  process.stdout.write(notes);
}

function findPreviousTag() {
  const tags = git(['tag', '--list', 'v*', '--sort=-v:refname']).split(/\r?\n/).filter(Boolean);
  return tags.find((tag) => tag !== currentTag && /^v\d+\.\d+\.\d+/.test(tag)) ?? null;
}

function getCommits(rangeToRead) {
  const output = git(['log', rangeToRead, '--format=%H%x1f%s%x1f%b%x1e']);
  return output.split('\x1e').map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const [hash, subject = '', body = ''] = entry.split('\x1f');
    return { hash, subject, body: body?.trim() ?? '' };
  });
}

function buildNotes({ version: releaseVersion, currentTag: tag, previousTag: previous, commits: changes, range: compareRange }) {
  const groups = new Map([
    ['Features', []],
    ['Fixes', []],
    ['Performance', []],
    ['Documentation', []],
    ['Refactoring', []],
    ['Maintenance', []],
    ['Other changes', []],
  ]);

  for (const change of changes) groups.get(categoryFor(change.subject)).push(change);

  const lines = [
    `# Arrakis Control v${releaseVersion}`,
    '',
    '## Docker image',
    '',
    '```bash',
    `docker pull <docker-hub-username>/arrakis-control:${releaseVersion}`,
    '```',
    '',
    '## Changes',
    '',
  ];

  if (changes.length === 0) lines.push('No source changes were recorded for this release.');
  for (const [category, categoryChanges] of groups) {
    if (categoryChanges.length === 0) continue;
    lines.push(`### ${category}`, '');
    for (const change of categoryChanges) {
      lines.push(`- ${change.subject} (${change.hash.slice(0, 7)})`);
      if (change.body) lines.push(`  ${change.body.replace(/\r?\n/g, '\n  ')}`);
    }
    lines.push('');
  }

  const changedFiles = previous
    ? git(['diff', '--stat', compareRange]).trim()
    : git(['diff', '--stat', emptyTreeHash(), 'HEAD']).trim();
  if (changedFiles) lines.push('## Changed files', '', '```text', changedFiles, '```', '');

  if (process.env.GITHUB_REPOSITORY && previous) {
    lines.push(`Full comparison: https://github.com/${process.env.GITHUB_REPOSITORY}/compare/${previous}...${tag}`, '');
  }

  return `${lines.join('\n')}\n`;
}

function categoryFor(subject) {
  const type = subject.match(/^(\w+)(?:\(.+?\))?!?:/i)?.[1]?.toLowerCase();
  return ({ feat: 'Features', fix: 'Fixes', perf: 'Performance', docs: 'Documentation', refactor: 'Refactoring', chore: 'Maintenance', build: 'Maintenance', ci: 'Maintenance', test: 'Maintenance' })[type] ?? 'Other changes';
}

function git(args) {
  return execFileSync('git', args, { cwd: rootPath, encoding: 'utf8' });
}

function emptyTreeHash() {
  return execFileSync('git', ['hash-object', '-t', 'tree', '--stdin'], {
    cwd: rootPath,
    encoding: 'utf8',
    input: '',
  }).trim();
}
