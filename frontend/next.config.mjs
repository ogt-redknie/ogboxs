import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 解决 monorepo 中文件追踪问题（关键！）
  outputFileTracingRoot: path.join(__dirname, '../../'),   // 从 frontend/ 向上两级到仓库根

  // 如果你后续要做 Capacitor 移动端打包，可以先不加 output: 'export'
  // output: 'export',   // 暂时注释掉

  // 可选：关闭实验性构建模式（日志里出现了 --experimental-build-mode generate，可能引起问题）
  // experimental: {
  //   buildMode: undefined,   // 如果有的话可以试着去掉
  // },
};

export default nextConfig;