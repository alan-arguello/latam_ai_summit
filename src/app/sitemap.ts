import type { MetadataRoute } from "next";
import { siteUrl, isPublicSite } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return isPublicSite
    ? [{ url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 }]
    : [];
}
