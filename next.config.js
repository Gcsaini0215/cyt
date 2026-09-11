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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Blocks clickjacking: no site can load our pages (incl. the lead
          // forms) in an <iframe> to trick a click/submit.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops the browser from guessing content-types (e.g. treating an
          // uploaded file as HTML/JS).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full referrer only to our own origin; just the origin
          // (no path/query) cross-site.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Locks the browser to HTTPS for this domain for 2 years (we
          // already redirect http->https; this stops a downgrade on repeat
          // visits once the browser has seen it once).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Disable browser features we don't use, in case a third-party
          // script ever tries to.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
