/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Supabase storage domains for <Image> component
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;

