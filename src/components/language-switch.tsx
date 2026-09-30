"use client";

import {
  LOCALE_COOKIE,
  localeInfo,
  locales,
  type Locale,
} from "@/i18n/config";

// ES / EN toggle. Plain links, so it works without JavaScript; with it, the
// choice is remembered for "/" and the current section (#agenda…) is kept.
export function LanguageSwitch({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  return (
    <nav className="ds-lang" aria-label={label}>
      {locales.map((locale) => (
        <a
          key={locale}
          href={`/${locale}`}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          aria-label={localeInfo[locale].label}
          onClick={(event) => {
            document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
            if (locale !== current && window.location.hash)
              event.currentTarget.href = `/${locale}${window.location.hash}`;
          }}
        >
          {localeInfo[locale].short}
        </a>
      ))}
    </nav>
  );
}
