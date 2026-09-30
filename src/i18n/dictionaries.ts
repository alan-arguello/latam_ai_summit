import type { Locale } from "./config";
import es from "./dictionaries/es";
import en from "./dictionaries/en";

// Both dictionaries are small, so they are imported statically; they only
// ever run on the server and never reach the client bundle.
export type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = { es, en };

export const getDictionary = (locale: Locale) => dictionaries[locale];
