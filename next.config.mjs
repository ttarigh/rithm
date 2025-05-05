/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jirpoyvesvwtsykqrxzf.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/explore_screenshots/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos', // Also add picsum for the seeded profiles
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
