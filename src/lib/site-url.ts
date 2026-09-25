export function getSiteUrl(
  env: Record<string, string | undefined> = process.env,
) {
  const configured = env.SITE_URL?.trim();
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate =
    configured ||
    (vercel ? `https://${vercel}` : `http://localhost:${env.PORT || "3105"}`);
  const url = new URL(candidate);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "SITE_URL must be an http(s) origin without a path, credentials or query.",
    );
  }
  return url.origin;
}

export const siteUrl = getSiteUrl();
export const isPublicSite =
  Boolean(
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim(),
  ) && process.env.VERCEL_ENV !== "preview";
