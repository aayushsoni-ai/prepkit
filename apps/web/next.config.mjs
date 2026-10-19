/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiTarget = process.env.INTERNAL_API_URL || "http://127.0.0.1:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
