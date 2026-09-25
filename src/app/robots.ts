import type { MetadataRoute } from "next";
import { siteUrl, isPublicSite } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(isPublicSite ? { allow: "/" } : { disallow: "/" }),
    },
    ...(isPublicSite ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
