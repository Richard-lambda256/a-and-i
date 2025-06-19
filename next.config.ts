import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 lint 체크 비활성화
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 💥 타입스크립트 오류 무시하고 빌드 계속
    ignoreBuildErrors: true,
  },
};

export default nextConfig;