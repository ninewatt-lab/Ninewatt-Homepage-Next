import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ninewatt-homepage.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:locale(ko|en|ja|fr)/solar",
        destination: "/:locale/energy/solar",
        permanent: true,
      },
      // /solar/contact 만 예외 — /energy/solar/contact 라우트는 존재한 적이 없어
      // 아래 일반 규칙에 걸리면 404로 떨어진다. 문의는 /energy/contact 가 받는다.
      // (일반 규칙보다 먼저 와야 매칭된다)
      {
        source: "/:locale(ko|en|ja|fr)/solar/contact",
        destination: "/:locale/energy/contact",
        permanent: true,
      },
      {
        source: "/:locale(ko|en|ja|fr)/solar/:path*",
        destination: "/:locale/energy/solar/:path*",
        permanent: true,
      },
      // 제품 페이지 중복 해소 — /product/* 를 정식으로 삼는다.
      // /energy/products/* 는 같은 콘텐츠를 두 경로에 두어 색인을 분산시켰다.
      // 기존 색인 자산 이전에 시간이 걸리므로 최소 1년 유지할 것.
      {
        source: "/:locale(ko|en|ja|fr)/energy/products/:path*",
        destination: "/:locale/product/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
