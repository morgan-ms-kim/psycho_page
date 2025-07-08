/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
    excludeFiles: ['tests/**/*'], // tests 폴더 전체 제외
  },
};

module.exports = nextConfig; 