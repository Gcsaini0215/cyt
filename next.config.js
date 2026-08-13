/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,
  // Lets a verification build run in its own output folder (BUILD_DIR=.next-verify)
  // so it never fights the running `npm run dev` server over the shared .next folder.
  distDir: process.env.BUILD_DIR || '.next',
  onDemandEntries: {
    maxInactiveAge: 60000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
