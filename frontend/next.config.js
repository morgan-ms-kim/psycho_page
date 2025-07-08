/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.js$|\.jsx$|\.ts$|\.tsx$|\.css$/,
      exclude: [
        path.resolve(__dirname, 'tests'),
      ],
    });
    return config;
  },
};

module.exports = nextConfig; 