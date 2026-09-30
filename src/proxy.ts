import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  hasLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";

// The language a visitor asked for: their last pick (cookie), then the
// browser's Accept-Language ranking, then Spanish.
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;

  const ranked = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: q ? Number(q.trim().slice(2)) : 1,
        index,
      };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { language } of ranked) if (hasLocale(language)) return language;
  return defaultLocale;
}

// Only paths without a locale reach this (see the matcher): "/" and any old
// link such as /latam-ai-summit.ics are redirected to the same path under
// the visitor's language.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname === "/" ? "" : url.pathname;
  url.pathname = `/${preferredLocale(request)}${path}`;
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  matcher: [
    // Everything except localized pages, Next and Vercel internals (Web
    // Analytics loads from /_vercel/insights), public files and the root
    // metadata routes.
    "/((?!es(?:/|$)|en(?:/|$)|_next/|_vercel/|images/|icon\\.png|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)",
  ],
};
