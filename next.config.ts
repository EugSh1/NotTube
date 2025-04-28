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
            },
            {
                protocol: "http",
                hostname: "127.0.0.1"
            }
        ]
    }
};

export default nextConfig;
