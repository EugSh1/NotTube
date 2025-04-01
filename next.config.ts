import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "500mb"
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com"
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: "/api/uploads/:path*"
            }
        ];
    }
};

export default nextConfig;
