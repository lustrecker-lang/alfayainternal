import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Commented out to support dynamic routes like [id]
    // If you need static export, use query params instead of dynamic routes
    // If you need static export, use query params instead of dynamic routes
    output: 'export',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
