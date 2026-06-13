/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.normies.art'],
  },
  async rewrites() {
    return [
      {
        source: '/api/normies/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
