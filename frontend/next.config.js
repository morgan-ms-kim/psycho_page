/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig; 