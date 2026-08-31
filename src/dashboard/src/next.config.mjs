import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
let currentDir = path.dirname(__filename);

// Dynamically search backwards to find the root workspace directory containing the .env file
let envPath = null;
while (currentDir !== path.parse(currentDir).root) {
  const checkPath = path.join(currentDir, '.env');
  if (fs.existsSync(checkPath)) {
    envPath = checkPath;
    break;
  }
  currentDir = path.dirname(currentDir);
}

// Load the dynamically discovered environment configuration file if found
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  console.warn("⚠️ Next.js dynamic search failed to locate a root project .env configuration file.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Safely sets tracing boundaries relative to our dynamically discovered workspace root
  outputFileTracingRoot: envPath ? path.dirname(envPath) : undefined,
  
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
      }
    ];
  },
};

export default nextConfig;
