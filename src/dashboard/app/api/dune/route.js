const {
  DuneConsoleClient,
} = require('../../../../infrastructure/api/core/DuneConsoleClient');

function getDuneClient() {
  if (!process.env.CONSOLE_URL) {
    throw new Error('CONSOLE_URL is not configured');
  }

  if (!global.duneConsoleClientInstance) {
    global.duneConsoleClientInstance = new DuneConsoleClient(
      process.env.CONSOLE_URL
    );

    global.duneConsoleClientInstance
      .login(process.env.CONSOLE_PASSWORD)
      .catch(() => {});
  }

  return global.duneConsoleClientInstance;
}

export { getDuneClient };