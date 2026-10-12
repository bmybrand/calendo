import type { MetadataRoute } from "next";

/** Public routes included in sitemap and SEO audits */
export const PUBLIC_SITE_ROUTES = ["/login"] as const;

/** App routes audited for technical SEO (noindex dashboard — still checked for metadata) */
export const APP_SITE_ROUTES = [
  "/login",
  "/dashboard",
  "/calendar",
  "/ai-studio",
  "/brands",
  "/analytics",
] as const;

/** Normalize host-only values like `calendo-phi.vercel.app` → `https://…` */
export function getSiteBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteBaseUrl()}${normalized}`;
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_SITE_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/login" ? "monthly" : "weekly",
    priority: path === "/login" ? 1 : 0.7,
  }));
}
