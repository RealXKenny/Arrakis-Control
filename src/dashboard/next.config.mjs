import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dashboard: src/dashboard/src
// Workspace: Arrakis-Control
const workspaceRoot = path.resolve(__dirname, '../');

// Locate the workspace .env file.
let currentDir = workspaceRoot;
let envPath = null;

while (currentDir !== path.parse(currentDir).root) {
  const checkPath = path.join(currentDir, '.env');

  if (fs.existsSync(checkPath)) {
    envPath = checkPath;
    break;
  }

  currentDir = path.dirname(currentDir);
}

// Load the workspace environment variables.
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