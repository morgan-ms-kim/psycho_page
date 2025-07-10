const path = require('path');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: true,
  },
  /*experimental: {
    forceSwcTransforms: true,
  },*/
};

module.exports = nextConfig;