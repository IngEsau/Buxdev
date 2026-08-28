import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://buxdev.com/',
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://buxdev.com/about/',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://buxdev.com/services/',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://buxdev.com/work/',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://buxdev.com/contact/',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
