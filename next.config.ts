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
      {
        source: "/:locale(ko|en|ja|fr)/solar/:path*",
        destination: "/:locale/energy/solar/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
