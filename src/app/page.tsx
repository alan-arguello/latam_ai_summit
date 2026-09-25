import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Globe,
  Handshake,
  Landmark,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  agenda,
  confirmedCompanies,
  consulates,
  formatTimeRange,
  googleCalendarUrl,
  invitedCompanies,
  speakerById,
  speakers,
  summit,
  themes,
  venueAddress,
  type AgendaItem,
  type Speaker,
} from "@/lib/summit";
import { isPublicSite, siteUrl } from "@/lib/site-url";
import {
  Button,
  CompanyLogo,
  LogoMark,
  Pill,
  SectionHeading,
} from "@/components/ui";
import { Countdown, SlotStatus } from "./event-clock";

const HERO_PHOTO = "/images/photos/golden-gate-fog.webp";
const VENUE_PHOTO = "/images/photos/golden-gate-sunset.webp";

const description =
  "Un encuentro en español durante SF Tech Week que conecta a la comunidad tech de Latinoamérica con Silicon Valley. 7 de octubre de 2026 en el Consulado General de Colombia en San Francisco.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: isPublicSite, follow: isPublicSite },
  title: "LATAM AI Summit · 7 de octubre, San Francisco | #SFTechWeek",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_419",
    url: "/",
    siteName: summit.name,
    title: "LATAM AI Summit · San Francisco, 7 de octubre",
    description:
      "Un día. Una comunidad. Un idioma. Siete consulados latinoamericanos reúnen a la comunidad tech de la región en San Francisco durante SF Tech Week.",
    images: [
      {
        url: "/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "LATAM AI Summit. San Francisco, 7 de octubre de 2026. #SFTechWeek.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/opengraph.png"],
  },
};

const REGISTER_LABEL = "Regístrate al LATAM AI Summit en Partiful (nueva pestaña)";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const themeIcons = {
  spark: Sparkles,
  globe: Globe,
  capital: Landmark,
  people: Handshake,
} as const;

// Where to sample the fog photo for each placeholder portrait.
const placeholderCrops: Record<string, string> = {
  paolo: "18% 20%",
  openai: "62% 58%",
};

function Flags() {
  return (
    <ul className="lp-flags" aria-label="Consulados participantes">
      {consulates.map((consulate) => (
        <li key={consulate.country}>
          <Image src={consulate.flag} alt="" width={18} height={12} />
          {consulate.country}
        </li>
      ))}
    </ul>
  );
}

function Person({ speaker }: { speaker: Speaker }) {
  const detail =
    speaker.status === "tbc"
      ? "Por confirmar"
      : speaker.status === "tba"
        ? "Por anunciar"
        : speaker.org;
  return (
    <li>
      <a href={`#speaker-${speaker.id}`} className="lp-person">
        {speaker.image ? (
          <Image src={speaker.image} alt="" width={36} height={36} />
        ) : (
          <span className="lp-person-empty" aria-hidden="true">
            <UserRound />
          </span>
        )}
        <span>
          <strong>{speaker.name}</strong>
          <small>{detail}</small>
        </span>
      </a>
    </li>
  );
}

function AgendaRow({ item }: { item: AgendaItem }) {
  const major = item.highlight ?? false;
  return (
    <li className="lp-slot" id={`slot-${item.id}`} data-major={major}>
      <div className="lp-slot-time">
        <time dateTime={`${summit.date}T${item.start}`}>
          {formatTimeRange(item.start, item.end)}
        </time>
        <SlotStatus start={item.start} end={item.end ?? item.start} />
      </div>
      <div className="lp-slot-main">
        {major && (
          <div className="lp-slot-meta">
            <Pill tone="neutral">{item.kind}</Pill>
            {item.host && (
              <span className="lp-slot-host">
                con <CompanyLogo company={item.host} height={14} />
              </span>
            )}
          </div>
        )}
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {item.speakers && (
          <ul className="lp-people" aria-label="Speakers">
            {item.speakers.map((id) => (
              <Person key={id} speaker={speakerById(id)} />
            ))}
          </ul>
        )}
        {item.invited && (
          <div className="lp-invited">
            <span>Invitados por confirmar</span>
            <ul>
              {item.invited.map((company) => (
                <li key={company.name}>
                  <CompanyLogo company={company} height={14} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.showFlags && <Flags />}
      </div>
    </li>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const session = agenda.find((item) => item.id === speaker.session);
  const media = (
    <div className="lp-speaker-media" data-placeholder={!speaker.image}>
      {speaker.image ? (
        <Image
          src={speaker.image}
          alt={speaker.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1100px) 30vw, 220px"
          quality={90}
        />
      ) : (
        <>
          <Image
            src={HERO_PHOTO}
            alt=""
            fill
            sizes="220px"
            className="lp-speaker-haze"
            style={{ objectPosition: placeholderCrops[speaker.id] ?? "50% 50%" }}
          />
          <span className="lp-speaker-placeholder">
            {speaker.company && (
              <Image
                src={speaker.company.logo}
                alt=""
                width={Math.round(26 * speaker.company.ratio)}
                height={26}
              />
            )}
            Por anunciar
          </span>
        </>
      )}
      {speaker.status === "tbc" && (
        <Pill tone="white" className="lp-speaker-status">
          Por confirmar
        </Pill>
      )}
    </div>
  );
  const heading = (
    <div className="lp-speaker-head">
      <h3>
        {speaker.name}
        {speaker.linkedin && <ArrowUpRight aria-hidden="true" />}
      </h3>
      <p>{[speaker.role, speaker.org].filter(Boolean).join(" · ")}</p>
    </div>
  );
  return (
    <li className="lp-speaker" id={`speaker-${speaker.id}`}>
      {speaker.linkedin ? (
        <a
          href={speaker.linkedin}
          className="lp-speaker-link"
          {...external}
          aria-label={`${speaker.name}, ${speaker.role} · ${speaker.org}. LinkedIn (nueva pestaña)`}
        >
          {media}
          {heading}
        </a>
      ) : (
        <div className="lp-speaker-link">
          {media}
          {heading}
        </div>
      )}
      <p className="lp-speaker-bio">{speaker.bio}</p>
      <div className="lp-speaker-foot">
        {speaker.company ? (
          <CompanyLogo company={speaker.company} height={15} />
        ) : (
          <span>{session?.kind}</span>
        )}
        {session && (
          <a href={`#slot-${session.id}`}>
            {formatTimeRange(session.start)}
            <ArrowRight aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}

function Pass() {
  return (
    <a
      href={summit.registrationUrl}
      className="lp-pass"
      {...external}
      aria-label={REGISTER_LABEL}
    >
      <div className="lp-pass-card">
        <div className="lp-pass-head">
          <LogoMark />
          <span>Pase general</span>
        </div>
        <p className="lp-pass-title">San Francisco</p>
        <dl className="lp-pass-grid">
          <div>
            <dt>Fecha</dt>
            <dd>Mié 07.10.2026</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>10:00 a.m. PT</dd>
          </div>
          <div>
            <dt>Lugar</dt>
            <dd>Consulado de Colombia</dd>
          </div>
          <div>
            <dt>Entrada</dt>
            <dd>Gratuita</dd>
          </div>
        </dl>
        <div className="lp-pass-perf" aria-hidden="true" />
        <div className="lp-pass-foot">
          <span>{summit.hashtag}</span>
          <span className="lp-pass-cta">
            Reservar lugar <ArrowUpRight aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
}

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: summit.name,
  description,
  startDate: summit.startsAt,
  endDate: summit.endsAt,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  inLanguage: "es",
  isAccessibleForFree: true,
  image: [`${siteUrl}/images/opengraph.png`],
  location: {
    "@type": "Place",
    name: summit.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: summit.venue.street,
      addressLocality: "San Francisco",
      addressRegion: "CA",
      postalCode: "94111",
      addressCountry: "US",
    },
  },
  organizer: consulates.map((consulate) => ({
    "@type": "GovernmentOrganization",
    name: consulate.name,
  })),
  offers: {
    "@type": "Offer",
    url: summit.registrationUrl,
    price: 0,
    priceCurrency: "USD",
    availability: "https://schema.org/LimitedAvailability",
  },
  performer: speakers
    .filter((speaker) => speaker.image)
    .map((speaker) => ({ "@type": "Person", name: speaker.name })),
};

export default function SummitPage() {
  return (
    <div className="lp" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <a className="lp-skip" href="#contenido">
        Ir al contenido
      </a>

      <header className="lp-nav">
        <div className="ds-frame lp-nav-inner">
          <a href="#top" aria-label="LATAM AI Summit, inicio">
            <LogoMark />
          </a>
          <nav className="lp-nav-links" aria-label="Secciones">
            <a href="#agenda">Agenda</a>
            <a href="#speakers">Speakers</a>
            <a href="#consulados">Consulados</a>
            <a href="#lugar">Lugar</a>
          </nav>
          <div className="lp-nav-actions">
            <Button
              variant="secondary"
              href={googleCalendarUrl}
              external
              icon={<CalendarPlus aria-hidden="true" />}
              className="lp-nav-calendar"
            >
              Agendar
            </Button>
            <Button href={summit.registrationUrl} external label={REGISTER_LABEL}>
              Regístrate
            </Button>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="ds-band lp-hero-band" aria-labelledby="summit-title">
          <div className="ds-frame lp-hero">
            <div className="lp-hero-copy">
              <Pill tone="white">
                <span className="lp-live-dot" aria-hidden="true" />
                {summit.hashtag} · Evento en español
              </Pill>
              <h1 id="summit-title" className="ds-display-xl">
                LATAM AI Summit
              </h1>
            </div>
            <div className="lp-hero-aside">
              <p>
                Latinoamérica no está viendo el próximo cambio tecnológico
                desde la barrera. Lo está construyendo.
              </p>
              <div className="lp-actions">
                <Button
                  size="lg"
                  href={summit.registrationUrl}
                  external
                  label={REGISTER_LABEL}
                >
                  Regístrate gratis
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  href="#agenda"
                  icon={<ArrowRight aria-hidden="true" />}
                >
                  Ver agenda
                </Button>
              </div>
            </div>

            <figure className="lp-stage ds-media">
              <Image
                src={HERO_PHOTO}
                alt="Una torre del Golden Gate emerge sobre la niebla de San Francisco al atardecer."
                fill
                priority
                quality={90}
                sizes="(max-width: 1248px) 100vw, 1200px"
              />
              <div className="lp-stage-top">
                <Pill tone="white">
                  <time dateTime={summit.startsAt}>{summit.dateLabel}</time>
                </Pill>
                <Pill tone="white" className="lp-stage-countdown">
                  <Countdown />
                </Pill>
              </div>
              <dl className="lp-stage-facts">
                <div>
                  <dt>Hora</dt>
                  <dd>{summit.timeLabel}</dd>
                </div>
                <div>
                  <dt>Lugar</dt>
                  <dd>{summit.venue.name}</dd>
                </div>
                <div>
                  <dt>Idioma</dt>
                  <dd>Español</dd>
                </div>
                <div>
                  <dt>Entrada</dt>
                  <dd>Gratuita, cupo limitado</dd>
                </div>
              </dl>
            </figure>
          </div>
        </section>

        <section
          className="ds-band"
          id="consulados"
          aria-labelledby="consulates-title"
        >
          <div className="ds-frame lp-wall">
            <div className="lp-wall-head">
              <h2 id="consulates-title">
                Una iniciativa de siete consulados latinoamericanos en San
                Francisco
              </h2>
              <p>Un evento conjunto de toda la región</p>
            </div>
            <ul className="lp-wall-grid lp-consulates">
              {consulates.map((consulate) => (
                <li key={consulate.country}>
                  <Image
                    src={consulate.logo.src}
                    alt={consulate.name}
                    width={Math.round(56 * consulate.logo.ratio)}
                    height={56}
                    style={{ "--ratio": consulate.logo.ratio } as React.CSSProperties}
                  />
                  <span className="lp-wall-caption">{consulate.country}</span>
                </li>
              ))}
              <li className="lp-wall-note">
                <p>Siete países. Una comunidad. Un mismo idioma.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="about-title">
          <div className="ds-frame ds-section">
            <SectionHeading
              id="about-title"
              eyebrow="El summit"
              title="Un día, una comunidad, un idioma"
            >
              <p>
                Un encuentro en español que conecta a quienes construyen,
                invierten y escalan tecnología en Latinoamérica con la
                experiencia, el capital y las redes de Silicon Valley.
              </p>
            </SectionHeading>
            <ul className="lp-themes">
              {themes.map((theme) => {
                const Icon = themeIcons[theme.icon];
                return (
                  <li key={theme.title} className="ds-card">
                    <span className="ds-icon-tile">
                      <Icon aria-hidden="true" />
                    </span>
                    <h3>{theme.title}</h3>
                    <p>{theme.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="ds-band" id="agenda" aria-labelledby="agenda-title">
          <div className="ds-frame ds-section">
            <SectionHeading id="agenda-title" eyebrow="Programa" title="La agenda">
              <p>
                {summit.dateLabel}, hora de San Francisco (PT). Agenda tentativa,
                sujeta a cambios.
              </p>
              <div className="lp-actions">
                <Button
                  variant="secondary"
                  href={googleCalendarUrl}
                  external
                  icon={<CalendarPlus aria-hidden="true" />}
                >
                  Google Calendar
                </Button>
                <Button
                  variant="secondary"
                  href="/latam-ai-summit.ics"
                  download
                  icon={<CalendarPlus aria-hidden="true" />}
                >
                  Apple / Outlook
                </Button>
              </div>
            </SectionHeading>
            <ol className="lp-agenda">
              {agenda.map((item) => (
                <AgendaRow key={item.id} item={item} />
              ))}
            </ol>
          </div>
        </section>

        <section
          className="ds-band"
          id="speakers"
          aria-labelledby="speakers-title"
        >
          <div className="ds-frame ds-section">
            <SectionHeading
              id="speakers-title"
              eyebrow="Speakers"
              title="Las voces del summit"
            >
              <p>
                Latinoamericanos que invierten, investigan y construyen en la
                frontera de la IA. Más nombres muy pronto.
              </p>
            </SectionHeading>
            <ul className="lp-speakers">
              {speakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} />
              ))}
            </ul>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="companies-title">
          <div className="ds-frame lp-wall">
            <div className="lp-wall-head">
              <h2 id="companies-title">Compañías en la conversación</h2>
              <p>Participaciones sujetas a confirmación</p>
            </div>
            <ul className="lp-wall-grid lp-companies">
              {confirmedCompanies.map((company) => (
                <li key={company.name}>
                  <a
                    href={company.url}
                    {...external}
                    aria-label={`${company.name} (nueva pestaña)`}
                  >
                    <CompanyLogo company={company} height={24} />
                  </a>
                  <span className="lp-wall-caption">En la agenda</span>
                </li>
              ))}
              {invitedCompanies.map((company) => (
                <li key={company.name} data-invited="true">
                  <a
                    href={company.url}
                    {...external}
                    aria-label={`${company.name}, por confirmar (nueva pestaña)`}
                  >
                    <CompanyLogo company={company} height={24} />
                  </a>
                  <span className="lp-wall-caption">Por confirmar</span>
                </li>
              ))}
              <li className="lp-wall-note">
                <p>
                  Los logos identifican a cada organización y no implican
                  patrocinio.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="ds-band" id="lugar" aria-labelledby="venue-title">
          <div className="ds-frame ds-section lp-register">
            <div className="lp-register-copy">
              <p className="ds-eyebrow">Lugar y registro</p>
              <h2 id="venue-title" className="ds-display-l">
                Nos vemos en San Francisco
              </h2>
              <p className="lp-register-lead">
                Cupo limitado. Regístrate en Partiful para asegurar tu lugar y
                recibir las novedades del evento.
              </p>
              <dl className="lp-register-facts">
                <div>
                  <dt>Cuándo</dt>
                  <dd>
                    {summit.dateLabel}
                    <span>{summit.timeLabel}</span>
                  </dd>
                </div>
                <div>
                  <dt>Dónde</dt>
                  <dd>
                    {summit.venue.name}
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
                  label={REGISTER_LABEL}
                >
                  Regístrate en Partiful
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href={summit.venue.mapsUrl}
                  external
                  icon={<MapPin aria-hidden="true" />}
                >
                  Cómo llegar
                </Button>
              </div>
            </div>
            <div className="lp-register-visual">
              <div className="lp-register-photo ds-media">
                <Image
                  src={VENUE_PHOTO}
                  alt="El Golden Gate entre la niebla al atardecer."
                  fill
                  sizes="(max-width: 1100px) 100vw, 560px"
                  quality={86}
                />
              </div>
              <Pass />
            </div>
          </div>
        </section>
      </main>

      <footer className="ds-band lp-footer">
        <div className="ds-frame lp-footer-inner">
          <div className="lp-footer-brand">
            <LogoMark />
            <p>
              Un encuentro en español para la comunidad tech de Latinoamérica.
              San Francisco, 7 de octubre de 2026.
            </p>
          </div>
          <nav className="lp-footer-nav" aria-label="Pie de página">
            <div>
              <h2>Evento</h2>
              <a href="#agenda">Agenda</a>
              <a href="#speakers">Speakers</a>
              <a href="#consulados">Consulados</a>
              <a href="#lugar">Lugar</a>
            </div>
            <div>
              <h2>Registro</h2>
              <a href={summit.registrationUrl} {...external}>
                Partiful
              </a>
              <a href={googleCalendarUrl} {...external}>
                Google Calendar
              </a>
              <a href="/latam-ai-summit.ics" download>
                Apple / Outlook
              </a>
              <a href={summit.venue.mapsUrl} {...external}>
                Cómo llegar
              </a>
            </div>
            <div>
              <h2>Consulados</h2>
              {consulates.map((consulate) => (
                <span key={consulate.country}>{consulate.country}</span>
              ))}
            </div>
            <div>
              <h2>SF Tech Week</h2>
              <a href={summit.techWeekUrl} {...external}>
                tech-week.com
              </a>
            </div>
          </nav>
        </div>
        <div className="ds-frame lp-footer-base">
          <p>© 2026 LATAM AI Summit · San Francisco, CA</p>
          <p>
            Fotos:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:The_Bridge_(August_2013).jpg"
              {...external}
            >
              Frank Schulenburg
            </a>{" "}
            y{" "}
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
        label={REGISTER_LABEL}
      >
        Regístrate · 7 de octubre
      </Button>
    </div>
  );
}
