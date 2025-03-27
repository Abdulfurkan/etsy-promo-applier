/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure environment variables are available
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Configure output for better Vercel compatibility
  output: 'standalone',
};

module.exports = nextConfig;
