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
};

export default withNextIntl(nextConfig);
