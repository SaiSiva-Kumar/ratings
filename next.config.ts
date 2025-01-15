import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com','iyoyrujxcajqbelaqtdx.supabase.co'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
