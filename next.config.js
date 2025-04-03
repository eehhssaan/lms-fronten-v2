/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Configure port 3000 for frontend as required
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // Allow dev origins for Replit feedback tool
    allowedDevOrigins: [
      "localhost:3000",
      "*.replit.dev",
      "*.*.replit.dev",
      "*.*.*.replit.dev",
    ],
  },
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Comment out X-Frame-Options to allow embedding in the feedback tool
          // {
          //   key: 'X-Frame-Options',
          //   value: 'SAMEORIGIN',
          // },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
