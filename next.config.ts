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
        remotePatterns: [
          {
            protocol: "https",
            hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : {},
};

export default nextConfig;
