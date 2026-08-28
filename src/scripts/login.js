require('dotenv').config();

const { DuneApi } = require('../api/DuneApi');
const { validateEnvironment } = require('../utils/environment/validateEnvironment');

validateEnvironment(['DUNE_CONSOLE_URL', 'DUNE_CONSOLE_PASSWORD']);

async function login() {
  const duneApi = new DuneApi(process.env.DUNE_CONSOLE_URL);
  await duneApi.login(process.env.DUNE_CONSOLE_PASSWORD);
  console.log(`Logged in to the Dune Console. Loaded ${duneApi.endpoints.length} documented endpoints.`);
}

login().catch((error) => {
  console.error('Unable to log in to the Dune Console:', error.message);
  process.exitCode = 1;
});
