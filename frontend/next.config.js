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
  // 빌드 최적화 설정
  swcMinify: true, // SWC 미니파이어 사용 (더 빠름)
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // 개발 시에만 캐시 무효화 (빌드 시간 단축)
  generateBuildId: async () => {
    if (process.env.NODE_ENV === 'development') {
      return 'dev-build';
    }
    return `build-${Date.now()}`;
  },
  
  // 정적 파일 캐시 무효화
  assetPrefix: process.env.NODE_ENV === 'production' ? '/psycho_page' : '',
  
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 프로덕션 빌드 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig; 