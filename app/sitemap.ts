import type { MetadataRoute } from "next"

import { absoluteUrl, INDEXABLE_PATHS } from "@/lib/seo"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }))
}
