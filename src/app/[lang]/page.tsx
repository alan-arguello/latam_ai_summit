import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Globe,
  Handshake,
  Landmark,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  format,
  hasLocale,
  localeInfo,
  locales,
  type Locale,
} from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import {
  agenda,
  agendaById,
  consulateByCode,
  consulates,
  formatTimeRange,
  googleCalendarUrl,
  organizers,
  speakerById,
  speakers,
  summit,
  supporters,
  themes,
  venueAddress,
  type AgendaItem,
  type Organizer,
  type Partner,
  type Speaker,
} from "@/lib/summit";
import { isPublicSite, siteUrl } from "@/lib/site-url";
import { Button, LogoMark, Pill, SectionHeading } from "@/components/ui";
import { Countdown, SlotStatus } from "@/components/event-clock";
import { LanguageSwitch } from "@/components/language-switch";
import { AsciiFog } from "@/components/ascii-fog";
import { DecodeTitle } from "@/components/decode-title";

const HERO_PHOTO = "/images/photos/golden-gate-fog.webp";
const VENUE_PHOTO = "/images/photos/golden-gate-sunset.webp";
const OG_IMAGE: Record<Locale, string> = {
  es: "/images/opengraph.png",
  en: "/images/opengraph-en.png",
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const themeIcons = {
  spark: Sparkles,
  globe: Globe,
  capital: Landmark,
  people: Handshake,
} as const;

type Ctx = { lang: Locale; t: Dictionary };

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    robots: { index: isPublicSite, follow: isPublicSite },
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: localeInfo[lang].og,
      alternateLocale: locales
        .filter((locale) => locale !== lang)
        .map((locale) => localeInfo[locale].og),
      url: `/${lang}`,
      siteName: summit.name,
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      images: [
        { url: OG_IMAGE[lang], width: 1200, height: 630, alt: t.meta.ogImageAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      images: [OG_IMAGE[lang]],
    },
  };
}

function Flags({ lang, t }: Ctx) {
  return (
    <ul className="lp-flags" aria-label={t.consulates.flags}>
      {consulates.map((consulate) => (
        <li key={consulate.code}>
          <Image src={consulate.flag} alt="" width={18} height={12} />
          {consulate.country[lang]}
        </li>
      ))}
    </ul>
  );
}

function Person({ speaker, lang, t }: Ctx & { speaker: Speaker }) {
  const tba = speaker.status === "tba";
  return (
    <li>
      <a href={`#speaker-${speaker.id}`} className="lp-person">
        {speaker.image ? (
          <Image src={speaker.image} alt="" width={36} height={36} />
        ) : (
          <span className="lp-person-empty" aria-hidden="true">
            {speaker.company && (
              <Image src={speaker.company.logo} alt="" width={16} height={16} />
            )}
          </span>
        )}
        <span>
          <strong>{tba ? t.agenda.tba : speaker.name}</strong>
          <small>
            {tba ? `${speaker.role[lang]} · ${speaker.org}` : speaker.org}
          </small>
        </span>
      </a>
    </li>
  );
}

function AgendaRow({ item, lang, t }: Ctx & { item: AgendaItem }) {
  const major = item.highlight ?? false;
  return (
    <li className="lp-slot" id={`slot-${item.id}`} data-major={major}>
      <div className="lp-slot-time">
        <time dateTime={`${summit.date}T${item.start}`}>
          {formatTimeRange(item.start, item.end, lang)}
        </time>
        <SlotStatus
          start={item.start}
          end={item.end ?? item.start}
          label={t.clock.now}
        />
      </div>
      <div className="lp-slot-main">
        {major && (
          <div className="lp-slot-meta">
            <Pill tone="neutral">{item.kind[lang]}</Pill>
          </div>
        )}
        <h3>{item.title[lang]}</h3>
        {item.description && <p>{item.description[lang]}</p>}
        {item.speakers && (
          <ul className="lp-people" aria-label={t.agenda.speakers}>
            {item.speakers.map((id) => (
              <Person key={id} speaker={speakerById(id)} lang={lang} t={t} />
            ))}
          </ul>
        )}
        {item.showFlags && <Flags lang={lang} t={t} />}
      </div>
    </li>
  );
}

function SpeakerCard({ speaker, lang, t }: Ctx & { speaker: Speaker }) {
  const session = agendaById(speaker.session);
  const tba = speaker.status === "tba";
  const name = tba ? t.speakers.tba : speaker.name;
  return (
    <li className="lp-speaker" id={`speaker-${speaker.id}`} data-tba={tba}>
      <div className="lp-speaker-top">
        <div className="lp-speaker-photo">
          {speaker.image ? (
            <Image
              src={speaker.image}
              alt=""
              fill
              sizes="(max-width: 640px) 88px, 120px"
              quality={90}
            />
          ) : (
            speaker.company && (
              <Image
                src={speaker.company.logo}
                alt=""
                width={40}
                height={40}
                className="lp-speaker-mark"
              />
            )
          )}
        </div>
        <a
          href={`#slot-${session.id}`}
          className="lp-speaker-session"
          aria-label={`${session.kind[lang]}, ${formatTimeRange(session.start, undefined, lang)}. ${t.speakers.session}`}
        >
          <span>{session.kind[lang]}</span>
          <time dateTime={`${summit.date}T${session.start}`}>
            {formatTimeRange(session.start, undefined, lang)}
          </time>
        </a>
      </div>
      <h3 className="lp-speaker-name">
        {speaker.linkedin ? (
          <a
            href={speaker.linkedin}
            {...external}
            aria-label={format(t.speakers.linkedin, { name })}
          >
            {name}
            <ArrowUpRight aria-hidden="true" />
          </a>
        ) : (
          name
        )}
      </h3>
      <p className="lp-speaker-role">
        {speaker.role[lang]} · <strong>{speaker.org}</strong>
      </p>
      <p className="lp-speaker-bio">{speaker.bio[lang]}</p>
    </li>
  );
}

function OrganizerCard({ person, lang, t }: Ctx & { person: Organizer }) {
  const consulate = person.consulate
    ? consulateByCode(person.consulate)
    : undefined;
  const initials = person.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return (
    <li>
      <a
        href={person.linkedin}
        className="lp-organizer"
        {...external}
        aria-label={format(t.speakers.linkedin, { name: person.name })}
      >
        <span className="lp-organizer-photo">
          {person.image ? (
            <Image
              src={person.image}
              alt=""
              fill
              sizes="72px"
              quality={90}
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </span>
        <ArrowUpRight className="lp-organizer-arrow" aria-hidden="true" />
        <span className="lp-organizer-name">{person.name}</span>
        <span className="lp-organizer-role">{person.role[lang]}</span>
        <span className="lp-organizer-org">
          {consulate && (
            <Image src={consulate.flag} alt="" width={18} height={12} />
          )}
          {consulate ? consulate.shortName[lang] : person.org}
        </span>
      </a>
    </li>
  );
}

// Optical sizing: every mark covers about the same area, whatever its shape.
const logoHeight = (logo: Partner["logo"], area: number, max: number) =>
  Math.min(max, Math.round(Math.sqrt(area / logo.ratio) * (logo.scale ?? 1)));

function Pass({ lang, t }: Ctx) {
  return (
    <a
      href={summit.registrationUrl}
      className="lp-pass"
      {...external}
      aria-label={t.a11y.register}
    >
      <div className="lp-pass-card">
        <div className="lp-pass-head">
          <LogoMark />
          <span>{t.pass.kind}</span>
        </div>
        <p className="lp-pass-title">San Francisco</p>
        <dl className="lp-pass-grid">
          <div>
            <dt>{t.pass.date}</dt>
            <dd>{t.pass.dateValue}</dd>
          </div>
          <div>
            <dt>{t.pass.time}</dt>
            <dd>{t.pass.timeValue}</dd>
          </div>
          <div>
            <dt>{t.pass.venue}</dt>
            <dd>{summit.venue.shortName[lang]}</dd>
          </div>
          <div>
            <dt>{t.pass.entry}</dt>
            <dd>{t.pass.entryValue}</dd>
          </div>
        </dl>
        <div className="lp-pass-perf" aria-hidden="true" />
        <div className="lp-pass-foot">
          <span>{summit.hashtag}</span>
          <span className="lp-pass-cta">
            {t.pass.cta} <ArrowUpRight aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
}

function eventSchema({ lang, t }: Ctx) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: summit.name,
    description: t.meta.description,
    url: `${siteUrl}/${lang}`,
    startDate: summit.startsAt,
    endDate: summit.endsAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: ["es", "en"],
    isAccessibleForFree: true,
    image: [`${siteUrl}${OG_IMAGE[lang]}`],
    location: {
      "@type": "Place",
      name: summit.venue.name[lang],
      address: {
        "@type": "PostalAddress",
        streetAddress: summit.venue.street,
        addressLocality: "San Francisco",
        addressRegion: "CA",
        postalCode: "94102",
        addressCountry: "US",
      },
    },
    organizer: consulates.map((consulate) => ({
      "@type": "GovernmentOrganization",
      name: consulate.name[lang],
    })),
    sponsor: supporters.map((partner) => ({
      "@type": "Organization",
      name: partner.name,
      url: partner.url,
    })),
    offers: {
      "@type": "Offer",
      url: summit.registrationUrl,
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/LimitedAvailability",
    },
    performer: speakers
      .filter((speaker) => speaker.status !== "tba")
      .map((speaker) => ({
        "@type": "Person",
        name: speaker.name,
        jobTitle: speaker.role[lang],
        worksFor: { "@type": "Organization", name: speaker.org },
        sameAs: speaker.linkedin,
      })),
  };
}

export default async function SummitPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const ctx = { lang, t };
  const calendarUrl = googleCalendarUrl(lang);
  const icsUrl = `/${lang}/latam-ai-summit.ics`;

  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventSchema(ctx)).replace(/</g, "\\u003c"),
        }}
      />
      <a className="lp-skip" href="#contenido">
        {t.a11y.skip}
      </a>

      <header className="lp-nav">
        <div className="ds-frame lp-nav-inner">
          <a href="#top" aria-label={t.a11y.home}>
            <LogoMark />
          </a>
          <nav className="lp-nav-links" aria-label={t.a11y.sections}>
            <a href="#agenda">{t.nav.agenda}</a>
            <a href="#speakers">{t.nav.speakers}</a>
            <a href="#organizadores">{t.nav.organizers}</a>
            <a href="#consulados">{t.nav.consulates}</a>
            <a href="#lugar">{t.nav.venue}</a>
          </nav>
          <div className="lp-nav-actions">
            <LanguageSwitch current={lang} label={t.a11y.language} />
            <Button
              variant="secondary"
              href={calendarUrl}
              external
              icon={<CalendarPlus aria-hidden="true" />}
              className="lp-nav-calendar"
            >
              {t.nav.calendar}
            </Button>
            <Button href={summit.registrationUrl} external label={t.a11y.register}>
              {t.nav.register}
            </Button>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="ds-band lp-hero-band" aria-labelledby="summit-title">
          <div className="ds-frame lp-hero">
            <AsciiFog tone="ink" className="lp-hero-fog" until=".lp-stage" />
            <div className="lp-hero-copy">
              <span data-fog-clear>
                <Pill tone="white">
                  <span className="lp-live-dot" aria-hidden="true" />
                  {summit.hashtag} · {t.hero.languages}
                </Pill>
              </span>
              <h1 id="summit-title" className="ds-display-xl" data-fog-clear="0.4">
                <DecodeTitle text="LATAM AI Summit" />
              </h1>
            </div>
            <div className="lp-hero-aside">
              <p data-fog-clear>{t.hero.lead}</p>
              <div className="lp-actions" data-fog-clear>
                <Button
                  size="lg"
                  href={summit.registrationUrl}
                  external
                  label={t.a11y.register}
                >
                  {t.hero.register}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  href="#agenda"
                  icon={<ArrowRight aria-hidden="true" />}
                >
                  {t.hero.agenda}
                </Button>
              </div>
            </div>

            <figure className="lp-stage ds-media">
              <Image
                src={HERO_PHOTO}
                alt={t.hero.photoAlt}
                fill
                priority
                quality={90}
                sizes="(max-width: 1248px) 100vw, 1200px"
              />
              <AsciiFog tone="light" className="lp-stage-fog" />
              <div className="lp-stage-top">
                <Pill tone="white">
                  <time dateTime={summit.startsAt}>{summit.dateLabel[lang]}</time>
                </Pill>
                <Pill tone="white" className="lp-stage-countdown">
                  <Countdown labels={t.clock} />
                </Pill>
              </div>
              <dl className="lp-stage-facts">
                <div>
                  <dt>{t.hero.time}</dt>
                  <dd>{summit.timeLabel[lang]}</dd>
                </div>
                <div>
                  <dt>{t.hero.venue}</dt>
                  <dd>{summit.venue.name[lang]}</dd>
                </div>
                <div>
                  <dt>{t.hero.languagesLabel}</dt>
                  <dd>{t.hero.languages}</dd>
                </div>
                <div>
                  <dt>{t.hero.entry}</dt>
                  <dd>{t.hero.entryValue}</dd>
                </div>
              </dl>
            </figure>
          </div>
        </section>

        <section
          className="ds-band lp-partners-band"
          id="consulados"
          aria-labelledby="consulates-title"
        >
          <div className="ds-frame ds-section">
            <SectionHeading
              id="consulates-title"
              eyebrow={t.consulates.eyebrow}
              title={t.consulates.title}
            >
              <p>{t.consulates.text}</p>
            </SectionHeading>
            <ul className="lp-partners">
              {consulates.map((consulate) => (
                <li
                  key={consulate.code}
                  className="lp-partner"
                  style={{ "--ratio": consulate.logo.ratio } as React.CSSProperties}
                >
                  <div className="lp-partner-logo">
                    <Image
                      src={consulate.logo.src}
                      alt={consulate.name[lang]}
                      width={Math.round(240 * consulate.logo.ratio)}
                      height={240}
                      sizes="240px"
                      quality={90}
                    />
                  </div>
                  <div className="lp-partner-meta">
                    <span>
                      <Image src={consulate.flag} alt="" width={18} height={12} />
                      {consulate.country[lang]}
                    </span>
                    <span className="lp-partner-kind">{t.consulates.consulate}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="about-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="about-title"
              eyebrow={t.about.eyebrow}
              title={t.about.title}
            >
              <p>{t.about.text}</p>
            </SectionHeading>
            <ul className="lp-themes">
              {themes.map((theme) => {
                const Icon = themeIcons[theme.icon];
                return (
                  <li key={theme.icon} className="ds-card">
                    <span className="ds-icon-tile">
                      <Icon aria-hidden="true" />
                    </span>
                    <h3>{theme.title[lang]}</h3>
                    <p>{theme.text[lang]}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="ds-band" id="agenda" aria-labelledby="agenda-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="agenda-title"
              eyebrow={t.agenda.eyebrow}
              title={t.agenda.title}
            >
              <p>{format(t.agenda.note, { date: summit.dateLabel[lang] })}</p>
              <div className="lp-actions">
                <Button
                  variant="secondary"
                  href={calendarUrl}
                  external
                  icon={<CalendarPlus aria-hidden="true" />}
                >
                  {t.agenda.google}
                </Button>
                <Button
                  variant="secondary"
                  href={icsUrl}
                  download
                  icon={<CalendarPlus aria-hidden="true" />}
                >
                  {t.agenda.ics}
                </Button>
              </div>
            </SectionHeading>
            <ol className="lp-agenda">
              {agenda.map((item) => (
                <AgendaRow key={item.id} item={item} {...ctx} />
              ))}
            </ol>
          </div>
        </section>

        <section className="ds-band" id="speakers" aria-labelledby="speakers-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="speakers-title"
              eyebrow={t.speakers.eyebrow}
              title={t.speakers.title}
            >
              <p>{t.speakers.text}</p>
            </SectionHeading>
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} {...ctx} />
              ))}
            </ul>
          </div>
        </section>

        <section
          className="ds-band lp-partners-band"
          id="organizadores"
          aria-labelledby="organizers-title"
        >
          <div className="ds-frame ds-section">
            <SectionHeading
              id="organizers-title"
              eyebrow={t.organizers.eyebrow}
              title={t.organizers.title}
            >
              <p>{t.organizers.text}</p>
            </SectionHeading>
            <ul className="lp-organizers">
              {organizers.map((person) => (
                <OrganizerCard key={person.id} person={person} {...ctx} />
              ))}
              <li className="lp-organizers-teams">
                <ul aria-hidden="true">
                  {consulates.map((consulate) => (
                    <li key={consulate.code}>
                      <Image src={consulate.flag} alt="" width={27} height={18} />
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>{t.organizers.teamsTitle}</strong>
                  {t.organizers.teamsText}
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="supporters-title">
          <div className="ds-frame lp-wall">
            <div className="lp-wall-head">
              <h2 id="supporters-title">{t.supporters.title}</h2>
              <p>{t.supporters.text}</p>
            </div>
            <ul className="lp-wall-grid lp-supporters">
              {supporters.map((supporter) => (
                <li key={supporter.name}>
                  <a
                    href={supporter.url}
                    {...external}
                    aria-label={`${supporter.name} (${t.a11y.newTab})`}
                    style={
                      {
                        "--logo-h": `${logoHeight(supporter.logo, 7600, 112)}px`,
                      } as React.CSSProperties
                    }
                  >
                    <Image
                      src={supporter.logo.src}
                      alt={supporter.name}
                      width={Math.round(240 * supporter.logo.ratio)}
                      height={240}
                      sizes="320px"
                      quality={90}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ds-band" id="lugar" aria-labelledby="venue-title">
          <div className="ds-frame ds-section lp-register">
            <div className="lp-register-copy">
              <p className="ds-eyebrow">{t.venue.eyebrow}</p>
              <h2 id="venue-title" className="ds-display-l">
                {t.venue.title}
              </h2>
              <p className="lp-register-lead">{t.venue.lead}</p>
              <dl className="lp-register-facts">
                <div>
                  <dt>{t.venue.when}</dt>
                  <dd>
                    {summit.dateLabel[lang]}
                    <span>{summit.timeLabel[lang]}</span>
                  </dd>
                </div>
                <div>
                  <dt>{t.venue.where}</dt>
                  <dd>
                    {summit.venue.name[lang]}
                    <span>
                      {venueAddress} · {summit.venue.neighborhood}
                    </span>
                  </dd>
                </div>
              </dl>
              <div className="lp-actions">
                <Button
                  size="lg"
                  href={summit.registrationUrl}
                  external
                  label={t.a11y.register}
                >
                  {t.venue.register}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href={summit.venue.mapsUrl}
                  external
                  icon={<MapPin aria-hidden="true" />}
                >
                  {t.venue.directions}
                </Button>
              </div>
            </div>
            <div className="lp-register-visual">
              <div className="lp-register-photo ds-media">
                <Image
                  src={VENUE_PHOTO}
                  alt={t.venue.photoAlt}
                  fill
                  sizes="(max-width: 1100px) 100vw, 560px"
                  quality={86}
                />
              </div>
              <Pass {...ctx} />
            </div>
          </div>
        </section>
      </main>

      <footer className="ds-band lp-footer">
        <div className="ds-frame lp-footer-inner">
          <div className="lp-footer-brand">
            <LogoMark />
            <p>{t.footer.tagline}</p>
          </div>
          <nav className="lp-footer-nav" aria-label={t.a11y.footer}>
            <div>
              <h2>{t.footer.event}</h2>
              <a href="#agenda">{t.nav.agenda}</a>
              <a href="#speakers">{t.nav.speakers}</a>
              <a href="#organizadores">{t.nav.organizers}</a>
              <a href="#lugar">{t.nav.venue}</a>
              <a href={summit.techWeekUrl} {...external}>
                SF Tech Week
              </a>
            </div>
            <div>
              <h2>{t.footer.registration}</h2>
              <a href={summit.registrationUrl} {...external}>
                Partiful
              </a>
              <a href={calendarUrl} {...external}>
                {t.agenda.google}
              </a>
              <a href={icsUrl} download>
                {t.agenda.ics}
              </a>
              <a href={summit.venue.mapsUrl} {...external}>
                {t.venue.directions}
              </a>
            </div>
            <div>
              <h2>{t.footer.consulates}</h2>
              {consulates.map((consulate) => (
                <span key={consulate.code}>{consulate.country[lang]}</span>
              ))}
            </div>
            <div>
              <h2>{t.footer.supporters}</h2>
              {supporters.map((supporter) => (
                <a key={supporter.name} href={supporter.url} {...external}>
                  {supporter.shortName}
                </a>
              ))}
            </div>
          </nav>
        </div>
        <div className="ds-frame lp-footer-base">
          <p>
            {t.footer.rights}
            {locales
              .filter((locale) => locale !== lang)
              .map((locale) => (
                <a key={locale} href={`/${locale}`} hrefLang={locale} lang={locale}>
                  {localeInfo[locale].label}
                </a>
              ))}
          </p>
          <p>
            {t.footer.photos}:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:The_Bridge_(August_2013).jpg"
              {...external}
            >
              Frank Schulenburg
            </a>{" "}
            {t.footer.and}{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_at_sunset_1.jpg"
              {...external}
            >
              Brocken Inaglory
            </a>
            , CC BY-SA 3.0.
          </p>
        </div>
      </footer>

      <Button
        href={summit.registrationUrl}
        external
        size="lg"
        className="lp-mobile-cta"
        label={t.a11y.register}
      >
        {t.mobileCta}
      </Button>
    </div>
  );
}
