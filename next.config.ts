import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.85'],
  outputFileTracingIncludes: {
    '/api/**': ['./emails/verification_email.html'],
  },
};

export default nextConfig;
