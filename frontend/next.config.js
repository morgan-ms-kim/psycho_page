const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: false, // 이 옵션이 있으면 domains는 무시됨, 최적화 원하면 false로
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smartpick.website',
        pathname: '/**',
      },
    ],
  },
  swcMinify: true,

  /*experimental: {
    forceSwcTransforms: true,
  },*/
};

module.exports = nextConfig;