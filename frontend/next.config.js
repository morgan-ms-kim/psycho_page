const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack(config) {
    // tests 폴더 무시 (필요에 따라)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /tests[\/\\]/,
      })
    );

    // tests 폴더 내 css는 null-loader 처리
    config.module.rules.push({
      test: /\.css$/,
      include: path.resolve(__dirname, 'tests'),
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;