import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES Module 中模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 解决 monorepo + Vercel 路径追踪问题（关键修复）
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // 如果你暂时不需要静态导出（Capacitor 移动端），先不要开启下面这行
  // output: 'export',

  // 其他常用配置（可根据需要添加）
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;