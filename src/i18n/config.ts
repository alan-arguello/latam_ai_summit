// Locales the site is published in. Every page lives under /[lang]; the proxy
// sends "/" to the visitor's language (cookie, then Accept-Language, then es).

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

// Set when a visitor picks a language, so "/" remembers the choice.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const hasLocale = (value: string | undefined): value is Locale =>
  locales.includes(value as Locale);

// A value written once per locale, e.g. { es: "Cierre", en: "Closing" }.
export type Localized<T = string> = Record<Locale, T>;

export const localeInfo: Record<
  Locale,
  { label: string; short: string; og: string }
> = {
  es: { label: "Español", short: "ES", og: "es_419" },
  en: { label: "English", short: "EN", og: "en_US" },
};

// Fills "{name}" placeholders: format("Faltan {n} días", { n: 9 }).
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
