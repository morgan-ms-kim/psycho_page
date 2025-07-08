const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack(config) {
    // tests 폴더 내 css는 null-loader로 처리
    config.module.rules.push({
      test: /\.css$/,
      include: path.resolve(__dirname, 'tests'),
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;