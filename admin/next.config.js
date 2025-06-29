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
  // 정적 파일 경로를 서버 경로에 맞게 설정
  assetPrefix: '/psycho_page/admin',
  // 서버 설정 추가
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // 빌드 출력 디렉토리 설정
  distDir: '.next',
  // 정적 파일 경로 설정
  publicRuntimeConfig: {
    staticFolder: '/psycho_page/admin',
  },
};

module.exports = nextConfig; 