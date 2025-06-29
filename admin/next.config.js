/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath 제거 - nginx에서 경로 처리
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
  // 정적 파일 경로를 절대 URL로 설정
  assetPrefix: 'https://smartpick.website/psycho_page/admin',
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig; 