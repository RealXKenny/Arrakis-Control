import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

/**
 * Dashboard: src/dashboard/src
 * Workspace: Arrakis-Control
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../');

/**
 * Find the nearest .env file, walking up from the workspace root.
 */
function findEnvFile(startDir) {
  let currentDir = startDir;

  while (true) {
    const envPath = path.join(currentDir, '.env');

    if (fs.existsSync(envPath)) {
      return envPath;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

/**
 * Load workspace environment variables.
 */
const envPath = findEnvFile(workspaceRoot);

if (envPath) {
  dotenv.config({ path: envPath });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Keep Next.js file tracing rooted at the workspace.
  outputFileTracingRoot: workspaceRoot,

  // Allow imports from outside the dashboard directory.
  experimental: {
    externalDir: true,
  },

  async rewrites() {
    return [
      {
        source: '/auth/callback',
        destination: '/api/auth/callback',
      },
      {
        source: '/auth/login',
        destination: '/api/auth/login',
      },
      {
        source: '/auth/logout',
        destination: '/api/auth/logout',
      },
    ];
  },
};

export default nextConfig;