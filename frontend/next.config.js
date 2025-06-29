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
        source: '/api/:path*',
        destination: '/psycho_page/api/:path*',
        permanent: false,
      },
    ];
  },
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 