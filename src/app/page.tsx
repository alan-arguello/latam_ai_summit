import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarPlus, MapPin } from "lucide-react";
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
import { GoldenGateAscii } from "./golden-gate-ascii";
import { SpeakerPortrait } from "./speaker-portrait";
import { EventCarousel } from "./event-carousel";
import { Countdown, SlotStatus } from "./event-clock";
import { CompanyLogo, LogoMark, PlaceholderPortrait } from "./marks";

const description =
  "Un encuentro en español durante SF Tech Week que conecta a la comunidad tech de Latinoamérica con Silicon Valley. 7 de octubre de 2026 en el Consulado de Colombia en San Francisco.";

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
      "Un día. Una comunidad. Un idioma. La comunidad tech de Latinoamérica se reúne en San Francisco durante SF Tech Week.",
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

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function RegisterButton({
  children = "Regístrate en Partiful",
  className = "la-button la-button-accent",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={summit.registrationUrl}
      className={className}
      {...external}
      aria-label="Regístrate al LATAM AI Summit en Partiful (nueva pestaña)"
    >
      {children} <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

function Flags({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className="la-flags"
      data-compact={compact}
      aria-label="Consulados participantes"
    >
      {consulates.map((consulate) => (
        <li key={consulate.country}>
          <Image
            src={consulate.flag}
            alt=""
            width={24}
            height={16}
            className="la-flag"
          />
          <span>{consulate.country}</span>
          {consulate.leads && !compact && <small>Lidera</small>}
        </li>
      ))}
    </ul>
  );
}

function SpeakerChip({ speaker }: { speaker: Speaker }) {
  return (
    <li>
      <a href={`#speaker-${speaker.id}`} className="la-chip">
        {speaker.image ? (
          <Image src={speaker.image} alt="" width={28} height={28} />
        ) : (
          <span className="la-chip-empty" aria-hidden="true">
            ?
          </span>
        )}
        <span>
          <strong>{speaker.name}</strong>
          <small>
            {speaker.status === "tbc"
              ? "Por confirmar"
              : speaker.status === "tba"
                ? "Por anunciar"
                : speaker.org}
          </small>
        </span>
      </a>
    </li>
  );
}

function AgendaSlot({ item }: { item: AgendaItem }) {
  return (
    <li
      className="la-slot"
      id={`slot-${item.id}`}
      data-highlight={item.highlight ?? false}
    >
      <div className="la-slot-time">
        <time dateTime={`${summit.date}T${item.start}`}>
          {formatTimeRange(item.start, item.end)}
        </time>
        <SlotStatus start={item.start} end={item.end ?? item.start} />
      </div>
      <div className="la-slot-body">
        <div className="la-slot-meta">
          <span className="la-slot-kind">{item.kind}</span>
          {item.host && (
            <span className="la-slot-host">
              con <CompanyLogo company={item.host} height={14} />
            </span>
          )}
        </div>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {item.speakers && (
          <ul className="la-chips" aria-label="Speakers">
            {item.speakers.map((id) => (
              <SpeakerChip key={id} speaker={speakerById(id)} />
            ))}
          </ul>
        )}
        {item.invited && (
          <div className="la-slot-invited">
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
        {item.showFlags && <Flags compact />}
      </div>
    </li>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const session = agenda.find((item) => item.id === speaker.session);
  const portrait = speaker.image ? (
    <SpeakerPortrait src={speaker.image} name={speaker.name} />
  ) : (
    <PlaceholderPortrait seed={speaker.id} company={speaker.company} />
  );
  const caption = (
    <>
      <div className="la-speaker-photo">
        {portrait}
        {speaker.status && (
          <span className="la-badge">
            {speaker.status === "tbc" ? "Por confirmar" : "Por anunciar"}
          </span>
        )}
      </div>
      <div className="la-speaker-caption">
        <h3>
          {speaker.name}
          {speaker.linkedin && (
            <ArrowUpRight className="la-speaker-arrow" aria-hidden="true" />
          )}
        </h3>
        <p>{[speaker.role, speaker.org].filter(Boolean).join(" · ")}</p>
      </div>
    </>
  );
  return (
    <article className="la-speaker" id={`speaker-${speaker.id}`}>
      {speaker.linkedin ? (
        <a
          href={speaker.linkedin}
          className="la-speaker-link"
          {...external}
          aria-label={`${speaker.name}, ${speaker.role} en ${speaker.org}. Perfil de LinkedIn (nueva pestaña)`}
        >
          {caption}
        </a>
      ) : (
        <div className="la-speaker-link">{caption}</div>
      )}
      <p className="la-speaker-bio">{speaker.bio}</p>
      <div className="la-speaker-foot">
        {speaker.company ? (
          <CompanyLogo company={speaker.company} height={16} />
        ) : (
          <span className="la-speaker-org">{session?.kind}</span>
        )}
        {session && (
          <a href={`#slot-${session.id}`} className="la-speaker-session">
            {formatTimeRange(session.start)}
            <ArrowRight aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

function Ticket() {
  return (
    <a
      href={summit.registrationUrl}
      className="la-ticket"
      {...external}
      aria-label="Pase al LATAM AI Summit: regístrate en Partiful (nueva pestaña)"
    >
      <div className="la-ticket-main">
        <div className="la-ticket-top">
          <span>Admit one</span>
          <span>N° 2026·10·07</span>
        </div>
        <p className="la-ticket-title">
          <span>LATAM</span>
          <span>AI Summit</span>
        </p>
        <dl className="la-ticket-grid">
          <div>
            <dt>Fecha</dt>
            <dd>07.10.2026</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>10:00 PT</dd>
          </div>
          <div>
            <dt>Lugar</dt>
            <dd>Consulado de Colombia</dd>
          </div>
          <div>
            <dt>Idioma</dt>
            <dd>Español</dd>
          </div>
        </dl>
      </div>
      <div className="la-ticket-stub">
        <span className="la-barcode" aria-hidden="true" />
        <span className="la-ticket-cta">
          Regístrate <ArrowUpRight aria-hidden="true" />
        </span>
        <span className="la-ticket-tag">{summit.hashtag}</span>
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
    <div className="la-page" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <a className="la-skip" href="#contenido">
        Ir al contenido
      </a>
      <header className="la-header">
        <div className="la-shell la-header-inner">
          <a href="#top" className="la-logo" aria-label="LATAM AI Summit, inicio">
            <LogoMark />
            <span>
              <strong>LATAM AI Summit</strong>
              <small>{summit.hashtag} · 07.10.2026</small>
            </span>
          </a>
          <nav aria-label="Secciones">
            <a href="#agenda">Agenda</a>
            <a href="#speakers">Speakers</a>
            <a href="#lugar">Lugar</a>
            <RegisterButton className="la-nav-cta">Regístrate</RegisterButton>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section className="la-hero" aria-labelledby="summit-title">
          <GoldenGateAscii />
          <div className="la-hero-content la-shell">
            <div className="la-hero-top">
              <span className="la-status">
                <span aria-hidden="true" />
                Registro abierto · Cupo limitado
              </span>
              <span className="la-hero-location">
                San Francisco, CA{" "}
                <span aria-hidden="true">[ 37.7749° N · 122.4194° W ]</span>
              </span>
            </div>
            <div className="la-hero-title">
              <p className="la-kicker">
                {summit.hashtag} <span aria-hidden="true">/</span> Evento en
                español
              </p>
              <h1 id="summit-title">
                <span className="la-title-main">LATAM</span>
                <span className="la-title-sub">
                  AI Summit
                  <span className="la-cursor" aria-hidden="true">
                    _
                  </span>
                </span>
              </h1>
              <p className="la-hero-lead">
                Latinoamérica no está viendo el próximo cambio tecnológico desde
                la barrera. <strong>Lo está construyendo.</strong>
              </p>
            </div>
            <div className="la-hero-bottom">
              <dl className="la-hero-facts">
                <div>
                  <dt>Cuándo</dt>
                  <dd>
                    <time dateTime={summit.startsAt}>{summit.dateLabel}</time>
                    <span>{summit.timeLabel}</span>
                  </dd>
                </div>
                <div>
                  <dt>Dónde</dt>
                  <dd>
                    {summit.venue.shortName}
                    <span>San Francisco, CA</span>
                  </dd>
                </div>
                <div className="la-hero-countdown">
                  <dt>Cuenta regresiva</dt>
                  <dd>
                    <Countdown />
                    <span>Entrada gratuita</span>
                  </dd>
                </div>
              </dl>
              <RegisterButton />
            </div>
          </div>
        </section>

        <section
          className="la-consulates la-shell"
          aria-labelledby="consulates-title"
        >
          <h2 id="consulates-title">
            Una iniciativa de <strong>siete consulados</strong> latinoamericanos
            en San Francisco
          </h2>
          <Flags />
        </section>

        <section className="la-about la-shell" aria-labelledby="about-title">
          <div className="la-section-heading">
            <div>
              <span className="la-eyebrow">[ 01 ] El summit</span>
              <h2 id="about-title">
                Un día. Una comunidad.
                <br /> Un idioma.
              </h2>
            </div>
            <p>
              No es otra conferencia. Es un espacio para reunir a la región,
              intercambiar ideas sin traducción y crear conexiones que sigan
              después de SF Tech Week.
            </p>
          </div>
          <div className="la-about-grid">
            <p className="la-about-lead">
              Un encuentro en español que conecta a quienes construyen,
              invierten y escalan tecnología en Latinoamérica con la
              experiencia, el capital y las redes de{" "}
              <span>Silicon Valley.</span>
            </p>
            <ol className="la-themes" aria-label="Temas de conversación">
              {themes.map((theme, index) => (
                <li key={theme}>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {theme}
                </li>
              ))}
            </ol>
          </div>
          <dl className="la-stats">
            <div>
              <dt>Consulados aliados</dt>
              <dd>07</dd>
            </div>
            <div>
              <dt>Invitados</dt>
              <dd>150–200</dd>
            </div>
            <div>
              <dt>Personas en el encuentro anterior</dt>
              <dd>~300</dd>
            </div>
            <div>
              <dt>Idioma del evento</dt>
              <dd>ES</dd>
            </div>
          </dl>
        </section>

        <section
          className="la-agenda la-shell"
          id="agenda"
          aria-labelledby="agenda-title"
        >
          <div className="la-section-heading">
            <div>
              <span className="la-eyebrow">[ 02 ] Programa</span>
              <h2 id="agenda-title">La agenda.</h2>
            </div>
            <p>
              {summit.dateLabel}
              <br />
              Hora de San Francisco (PT). Agenda tentativa, sujeta a cambios.
            </p>
          </div>
          <ol className="la-timeline">
            {agenda.map((item) => (
              <AgendaSlot key={item.id} item={item} />
            ))}
          </ol>
          <div className="la-agenda-cta">
            <p>Cupo limitado. El registro se hace en Partiful.</p>
            <RegisterButton>Reserva tu lugar</RegisterButton>
          </div>
        </section>

        <section
          className="la-speakers la-shell"
          id="speakers"
          aria-labelledby="speakers-title"
        >
          <div className="la-section-heading">
            <div>
              <span className="la-eyebrow">[ 03 ] Speakers</span>
              <h2 id="speakers-title">Las voces.</h2>
            </div>
            <p>
              Latinoamericanos que construyen, investigan e invierten en la
              frontera de la IA. Más nombres muy pronto.
            </p>
          </div>
          <div className="la-speaker-grid">
            {speakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
          <div className="la-companies">
            <div className="la-companies-group">
              <h3>En la agenda</h3>
              <ul>
                {confirmedCompanies.map((company) => (
                  <li key={company.name}>
                    <a
                      href={company.url}
                      {...external}
                      aria-label={`${company.name} (nueva pestaña)`}
                    >
                      <CompanyLogo company={company} height={24} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="la-companies-group" data-invited="true">
              <h3>Invitados · por confirmar</h3>
              <ul>
                {invitedCompanies.map((company) => (
                  <li key={company.name}>
                    <a
                      href={company.url}
                      {...external}
                      aria-label={`${company.name} (nueva pestaña)`}
                    >
                      <CompanyLogo company={company} height={24} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="la-note">
            Participaciones sujetas a confirmación. Los logos identifican a la
            organización de cada speaker y no implican patrocinio del evento.
          </p>
        </section>

        <section
          className="la-community la-shell"
          aria-labelledby="community-title"
        >
          <div className="la-section-heading">
            <div>
              <span className="la-eyebrow">[ 04 ] La comunidad</span>
              <h2 id="community-title">
                Desde Silicon Valley
                <br /> para toda Latinoamérica.
              </h2>
            </div>
            <p>
              Nuestro encuentro anterior reunió a cerca de 300 personas. Esta
              vez pensamos más grande: más países, más conversaciones y más
              conexiones.
            </p>
          </div>
          <EventCarousel />
        </section>

        <section
          className="la-venue"
          id="lugar"
          aria-labelledby="venue-title"
        >
          <div className="la-shell la-venue-grid">
            <div className="la-venue-copy">
              <span className="la-venue-marker" aria-hidden="true">
                [ + ]
              </span>
              <h2 id="venue-title">
                Nos vemos en
                <br />
                <span>San Francisco.</span>
              </h2>
              <p>
                Cupo limitado. Regístrate en Partiful para asegurar tu lugar y
                recibir las novedades del evento.
              </p>
              <dl className="la-venue-details">
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
              <div className="la-venue-actions">
                <RegisterButton />
                <a
                  href={summit.venue.mapsUrl}
                  className="la-button la-button-ghost"
                  {...external}
                >
                  <MapPin aria-hidden="true" /> Cómo llegar
                </a>
              </div>
              <p className="la-calendar-links">
                <CalendarPlus aria-hidden="true" />
                Agregar al calendario:{" "}
                <a href={googleCalendarUrl} {...external}>
                  Google
                </a>
                <span aria-hidden="true">·</span>
                <a href="/latam-ai-summit.ics" download>
                  Apple / Outlook
                </a>
              </p>
            </div>
            <Ticket />
          </div>
        </section>
      </main>

      <footer className="la-footer la-shell">
        <div className="la-footer-main">
          <a href="#top" className="la-logo" aria-label="Volver arriba">
            <LogoMark size={24} />
            <span>
              <strong>LATAM AI Summit</strong>
              <small>San Francisco · 2026</small>
            </span>
          </a>
          <p>
            Parte de{" "}
            <a href={summit.techWeekUrl} {...external}>
              {summit.hashtag}
            </a>
            , una semana de eventos del ecosistema tech en San Francisco.
          </p>
          <RegisterButton className="la-footer-cta">Regístrate</RegisterButton>
        </div>
        <p className="la-credit">
          Fotografía del Golden Gate:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:GoldenGateBridge-001.jpg"
            {...external}
          >
            Rich Niewiroski Jr. · CC BY 2.5
          </a>
          , reflejada y convertida a ASCII.
        </p>
      </footer>

      <RegisterButton className="la-mobile-cta">
        Regístrate · 7 de octubre
      </RegisterButton>
    </div>
  );
}
