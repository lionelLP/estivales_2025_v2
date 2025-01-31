/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://estivales-brou.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/login", "/api/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/admin", "/login", "/api"],
        allow: "/",
      },
    ],
  },
  changefreq: "weekly",
  priority: 0.7,
};
