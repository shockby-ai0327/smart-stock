/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/smart-stock/v2',
  assetPrefix: '/smart-stock/v2/',
  images: { unoptimized: true },
  trailingSlash: true,  // /methodology → /methodology/index.html (GitHub Pages 需要)
};

module.exports = nextConfig;
