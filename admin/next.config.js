/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/psycho_page/admin',
  assetPrefix: '/psycho_page/admin',
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
};