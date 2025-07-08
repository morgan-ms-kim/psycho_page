const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;