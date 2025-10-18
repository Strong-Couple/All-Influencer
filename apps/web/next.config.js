/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@all-influencer/ui',
    '@all-influencer/types',
    '@all-influencer/utils',
    '@all-influencer/sdk',
  ],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

