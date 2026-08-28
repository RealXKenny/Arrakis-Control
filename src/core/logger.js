const LEVELS = Object.freeze({ DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 });

function createLogger(scope, minimumLevel = process.env.LOG_LEVEL ?? 'INFO') {
  const threshold = LEVELS[minimumLevel.toUpperCase()] ?? LEVELS.INFO;

  function write(level, message, error) {
    if (LEVELS[level] < threshold) return;

    const prefix = `[${new Date().toISOString()}] [${level}] [${scope}]`;
    const output = `${prefix} ${message}`;

    if (level === 'ERROR') {
      console.error(output, error instanceof Error ? error.message : error ?? '');
    } else if (level === 'WARN') {
      console.warn(output, error ?? '');
    } else {
      console.log(output, error ?? '');
    }
  }

  return Object.freeze({
    debug: (message, details) => write('DEBUG', message, details),
    info: (message, details) => write('INFO', message, details),
    warn: (message, details) => write('WARN', message, details),
    error: (message, error) => write('ERROR', message, error),
  });
}

module.exports = { createLogger };
