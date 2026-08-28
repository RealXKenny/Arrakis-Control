function validateEnvironment(requiredKeys) {
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingKeys.join(', ')}`);
  }
}

module.exports = { validateEnvironment };
