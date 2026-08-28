const { DuneApi } = require("../infrastructure/api/DuneApi");
const { loadEnvironment } = require("../infrastructure/config/environment");
const { createLogger } = require("../infrastructure/core/logger");

const config = loadEnvironment(["DUNE_CONSOLE_URL", "DUNE_CONSOLE_PASSWORD"]);
const logger = createLogger("DUNE LOGIN", config.logLevel);

async function login() {
  const duneApi = new DuneApi(config.duneConsoleUrl);
  await duneApi.login(config.duneConsolePassword);
  logger.info(`Logged in to the Dune Console. Loaded ${duneApi.endpoints.length} documented endpoints.`);
}

login().catch((error) => {
  logger.error("Unable to log in to the Dune Console.", error);
  process.exitCode = 1;
});
