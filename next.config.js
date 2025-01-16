/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com','iyoyrujxcajqbelaqtdx.supabase.co'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
