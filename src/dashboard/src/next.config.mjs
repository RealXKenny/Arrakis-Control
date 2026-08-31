import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  
  // Maps legacy routing calls directly into your Next.js directory tree
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
