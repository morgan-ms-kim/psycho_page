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
  // 캐시 무효화 설정
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // 정적 파일 캐시 무효화
  assetPrefix: process.env.NODE_ENV === 'production' ? '/psycho_page' : '',
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 