import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { siteUrl, isPublicSite } from "@/lib/site-url";

// One entry per language, each listing the other as its alternate.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicSite) return [];
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${siteUrl}/${locale}`]),
  );
  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
  }));
}
