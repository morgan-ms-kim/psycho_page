/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/psycho_page',
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