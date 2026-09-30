import { lang } from "next/root-params";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button, LogoMark } from "@/components/ui";

// Unknown paths under /es or /en, in the visitor's language.
export default async function NotFound() {
  const value = await lang();
  const locale = hasLocale(value) ? value : defaultLocale;
  const t = getDictionary(locale);
  return (
    <main className="lp lp-missing">
      <LogoMark />
      <h1 className="ds-display-m">{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <Button href={`/${locale}`}>{t.notFound.home}</Button>
    </main>
  );
}
