import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.191'],
  outputFileTracingIncludes: {
    '/api/**': [
      './emails/verification_email.html',
      './emails/reset_password_email.html',
    ],
  },
};

export default nextConfig;
