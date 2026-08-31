const { DuneConsoleClient } = require('../../../../infrastructure/api/core/DuneConsoleClient');

if (!global.duneConsoleClientInstance) {
  global.duneConsoleClientInstance = new DuneConsoleClient(
    process.env.CONSOLE_URL
  );

  global.duneConsoleClientInstance
    .login(process.env.CONSOLE_PASSWORD)
    .catch(() => {});
}

export const duneClient = global.duneConsoleClientInstance;