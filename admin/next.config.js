/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/psycho_page/admin',
  trailingSlash: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  // assetPrefix도 basePath와 일치시킴
  assetPrefix: process.env.NODE_ENV === 'production' ? '/psycho_page/admin' : '',
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 