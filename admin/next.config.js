/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/psycho_page/admin',
  assetPrefix: '/psycho_page/admin',
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig 