import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 lint 체크 비활성화
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
