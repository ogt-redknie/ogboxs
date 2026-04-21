/** @type {import('next').NextConfig} */
const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

const nextConfig = {
 outputFileTracingRoot: process.cwd(), 
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: isCapacitor,
  // Use relative paths for Capacitor, absolute paths for web (Vercel)
  assetPrefix: isCapacitor ? '.' : '',
};

export default nextConfig;
