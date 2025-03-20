/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "localhost",
      "estivales-brou.vercel.app",
      "img.youtube.com",
      "api.dicebear.com",
      "www.youtube.com",
      "youtu.be",
      "youtube.com",
      "i.ytimg.com",
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
