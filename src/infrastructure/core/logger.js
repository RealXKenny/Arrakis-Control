const LEVELS = Object.freeze({ DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 });
const COLORS = Object.freeze({
  reset: "\u001B[0m",
  dim: "\u001B[2m",
  cyan: "\u001B[36m",
  green: "\u001B[32m",
  yellow: "\u001B[33m",
  red: "\u001B[31m",
  magenta: "\u001B[35m",
  blue: "\u001B[34m",
  brightCyan: "\u001B[96m",
  brightGreen: "\u001B[92m",
  brightYellow: "\u001B[93m",
  brightMagenta: "\u001B[95m",
  brightBlue: "\u001B[94m",
  white: "\u001B[37m",
});
const LEVEL_COLORS = Object.freeze({
  DEBUG: COLORS.magenta,
  INFO: COLORS.green,
  WARN: COLORS.yellow,
  ERROR: COLORS.red,
});
const SCOPE_COLORS = Object.freeze({
  BOT: COLORS.brightYellow,
  DISCORD: COLORS.brightCyan,
  "SHARD MANAGER": COLORS.brightMagenta,
  "PLAYER PANEL": COLORS.brightGreen,
  "BLUEPRINT PANEL": COLORS.yellow,
  COMMANDS: COLORS.brightBlue,
  COMPONENTS: COLORS.magenta,
  EVENTS: COLORS.green,
  INTERACTIONS: COLORS.cyan,
  "DUNE API": COLORS.yellow,
  "DISCORD ADAPTER": COLORS.brightCyan,
  "DISCORD AUDIT": COLORS.brightGreen,
  "DISCORD AUDIT LOG": COLORS.brightMagenta,
  default: COLORS.white,
});

function createLogger(scope, minimumLevel = process.env.LOG_LEVEL ?? "INFO") {
  const threshold = LEVELS[minimumLevel.toUpperCase()] ?? LEVELS.INFO;
  const scopeColor = SCOPE_COLORS[scope] ?? SCOPE_COLORS.default;

  function write(level, message, error) {
    if (LEVELS[level] < threshold) return;

    const timestamp = formatTimestamp(new Date());
    const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${LEVEL_COLORS[level]}[${level}]${COLORS.reset} ${scopeColor}[${scope}]${COLORS.reset} ${message}`;

    if (level === "ERROR") {
      error === undefined
        ? console.error(output)
        : console.error(output, error instanceof Error ? error.message : error);
    } else if (level === "WARN") {
      error === undefined ? console.warn(output) : console.warn(output, error);
    } else {
      error === undefined ? console.log(output) : console.log(output, error);
    }
  }

  return Object.freeze({
    header: (title, subtitle = "Discord control bot") => {
      if (LEVELS.INFO < threshold) return;
      const banner = [
      "  ██████╗██████╗ ██╗███╗   ███╗███████╗ ██████╗ ███╗   ██╗    ███████╗██╗  ██╗██╗███████╗███████╗ ",
      " ██╔════╝██╔══██╗██║████╗ ████║██╔════╝██╔═══██╗████╗  ██║    ██╔════╝██║ ██╔╝██║██╔════╝██╔════╝ ",
      " ██║     ██████╔╝██║██╔████╔██║███████╗██║   ██║██╔██╗ ██║    ███████╗█████╔╝ ██║█████╗  ███████╗ ",
      " ██║     ██╔══██╗██║██║╚██╔╝██║╚════██║██║   ██║██║╚██╗██║    ╚════██║██╔═██╗ ██║██╔══╝  ╚════██║ ",
      " ╚██████╗██║  ██║██║██║ ╚═╝ ██║███████║╚██████╔╝██║ ╚████║    ███████║██║  ██╗██║███████╗███████║ ",
      "  ╚═════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝ ",
      ].join("\n");
      console.log(`\n${COLORS.yellow}${banner}${COLORS.reset}`);
      console.log(`${COLORS.cyan}${title}${COLORS.reset} ${COLORS.dim}- ${subtitle}${COLORS.reset}\n`);
    },
    debug: (message, details) => write("DEBUG", message, details),
    info: (message, details) => write("INFO", message, details),
    warn: (message, details) => write("WARN", message, details),
    error: (message, error) => write("ERROR", message, error),
  });
}

function formatTimestamp(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.month}/${values.day}/${values.year} ${values.hour}:${values.minute}:${values.second} ${values.dayPeriod}`;
}

module.exports = { createLogger };
