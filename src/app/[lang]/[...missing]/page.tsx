import { notFound } from "next/navigation";

// Any other path under /es or /en renders the localized not-found page.
export default function Missing() {
  notFound();
}
