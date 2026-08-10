import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/questions",
        destination: "/projects",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
