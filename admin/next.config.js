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
  // 캐시 무효화 설정
  generateBuildId: async () => {
    return `admin-build-${Date.now()}`;
  },
  // 정적 파일 캐시 무효화
  assetPrefix: process.env.NODE_ENV === 'production' ? '/psycho_page/admin' : '',
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 