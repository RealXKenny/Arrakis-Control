const LEVELS = Object.freeze({ DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 });
const COLORS = Object.freeze({
  reset: '\u001B[0m',
  dim: '\u001B[2m',
  cyan: '\u001B[36m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  red: '\u001B[31m',
  magenta: '\u001B[35m',
});
const LEVEL_COLORS = Object.freeze({
  DEBUG: COLORS.magenta,
  INFO: COLORS.green,
  WARN: COLORS.yellow,
  ERROR: COLORS.red,
});

function createLogger(scope, minimumLevel = process.env.LOG_LEVEL ?? 'INFO') {
  const threshold = LEVELS[minimumLevel.toUpperCase()] ?? LEVELS.INFO;

  function write(level, message, error) {
    if (LEVELS[level] < threshold) return;

    const timestamp = formatTimestamp(new Date());
    const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${LEVEL_COLORS[level]}[${level}]${COLORS.reset} ${COLORS.cyan}[${scope}]${COLORS.reset} ${message}`;

    if (level === 'ERROR') {
      error === undefined ? console.error(output) : console.error(output, error instanceof Error ? error.message : error);
    } else if (level === 'WARN') {
      error === undefined ? console.warn(output) : console.warn(output, error);
    } else {
      error === undefined ? console.log(output) : console.log(output, error);
    }
  }

  return Object.freeze({
    header: (title, subtitle = 'Discord control bot') => {
      if (LEVELS.INFO < threshold) return;
      const line = '═'.repeat(54);
      console.log(`\n${COLORS.cyan}╔${line}╗\n║${COLORS.reset} ${title.padEnd(52)} ${COLORS.cyan}║\n║${COLORS.dim}${COLORS.reset} ${subtitle.padEnd(52)} ${COLORS.cyan}║\n╚${line}╝${COLORS.reset}`);
    },
    debug: (message, details) => write('DEBUG', message, details),
    info: (message, details) => write('INFO', message, details),
    warn: (message, details) => write('WARN', message, details),
    error: (message, error) => write('ERROR', message, error),
  });
}

function formatTimestamp(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.month}/${values.day}/${values.year} ${values.hour}:${values.minute}:${values.second} ${values.dayPeriod}`;
}

module.exports = { createLogger };
