const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.(js|ts|jsx|tsx|css)$/,
      include: path.resolve(__dirname, 'tests'),
      use: [
        {
          loader: require.resolve('null-loader'),
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
