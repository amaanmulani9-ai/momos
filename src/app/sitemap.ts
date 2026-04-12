import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://meghnamomos.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://meghnamomos.com/menu', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://meghnamomos.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://meghnamomos.com/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
