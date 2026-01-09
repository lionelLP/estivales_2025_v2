/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
    images: {
        domains: [],

        localPatterns: [
            {
                pathname: '/api/media-file',
            },
            {
                pathname: '/**',
            },
        ],

        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
            { protocol: 'http', hostname: 'localhost', pathname: '/**' },
            { protocol: 'https', hostname: 'estivales-brou.vercel.app', pathname: '/**' },
            { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
            { protocol: 'http', hostname: '192.168.1.115', pathname: '/**' },

            { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
            { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
            { protocol: 'https', hostname: '*.youtube.com', pathname: '/**' },
            { protocol: 'https', hostname: '*.youtu.be', pathname: '/**' },
        ],

        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;