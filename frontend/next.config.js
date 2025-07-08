const path = require('path');
const webpack = require('webpack'); // ✅ 이 줄이 반드시 필요

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack(config) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /tests[\/\\]/, // ✅ tests/ 폴더 무시
      })
    );
     // tests 폴더 내 .css 파일은 null-loader로 무시
     config.module.rules.push({
      test: /\.css$/,
      include: path.resolve(__dirname, 'tests'),
      use: 'null-loader',
    });
    return config;
  },

};

module.exports = nextConfig;