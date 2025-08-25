import type { MetadataRoute } from "next"

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    {
      url: "https://www.ignita.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://www.ignita.app/auth",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.ignita.app/auth/signup",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.ignita.app/legal",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1,
    },
  ]
}

export default sitemap
