/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/psycho_page/admin',
  assetPrefix: '/psycho_page/admin',
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  // Fast Refresh 문제 해결
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // 개발 모드에서 Fast Refresh 비활성화
  ...(process.env.NODE_ENV === 'production' && {
    reactStrictMode: true,
  }),
};