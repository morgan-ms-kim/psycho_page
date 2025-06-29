/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/psycho_page',
  assetPrefix: '/psycho_page',
  trailingSlash: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/psycho_page/api/:path*',
      },
    ];
  },
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 