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
      {
        source: "/job-search/settings",
        destination: "/job-search",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
