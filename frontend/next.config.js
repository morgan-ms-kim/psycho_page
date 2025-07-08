const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  /*experimental: {
    forceSwcTransforms: true,
  },*/
  webpack(config, options) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/tests\//, // 또는 /tests\//
      })
    );
  },




};

module.exports = nextConfig;
