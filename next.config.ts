import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostname = (() => {
  try {
    return supabaseUrl ? new URL(supabaseUrl).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: hostname
    ? {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60 * 60 * 24 * 7,
        remotePatterns: [
          {
            protocol: "https",
            hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : {},
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
      },
      {
        source: "/favicon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
    ];
  },
};

export default nextConfig;
