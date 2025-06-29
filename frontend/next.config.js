/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  async redirects() {
    return [
      {
        source: '/tests/:path*',
        destination: '/psycho_page/tests/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; 