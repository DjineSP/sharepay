import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async redirects() {
        return [
            // /features a été renommée en /services : on préserve les liens existants.
            {
                source: '/features',
                destination: '/services',
                permanent: true,
            },
            // /test-api a été renommée en /try.
            {
                source: '/test-api',
                destination: '/try',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/v1/:path(.*)',
                destination: 'http://localhost:3001/api/v1/:path*',
            },
        ];
    },
};

export default withNextIntl(nextConfig);
