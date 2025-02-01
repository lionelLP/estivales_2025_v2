/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
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
