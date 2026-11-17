const path = require('path');

// Load variables from .env (if present). Real environment variables, e.g. in CI, take priority.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable "${name}". Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

module.exports = {
  baseURL: requireEnv('BASE_URL'),
  standardUser: requireEnv('STANDARD_USER'),
  password: requireEnv('USER_PASSWORD'),
};
