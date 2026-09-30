// Single source of truth for the event: facts, agenda, speakers, organizers
// and partners. Anything a visitor reads is written in both languages
// ({ es, en }); UI copy lives in src/i18n/dictionaries.

import type { Locale, Localized } from "@/i18n/config";
import { endsAt, eventDate, startsAt } from "./schedule";

export const summit = {
  name: "LATAM AI Summit",
  hashtag: "#SFTechWeek",
  registrationUrl: "https://partiful.com/e/5bUpcnTFJ3nZUXUIvVbe",
  techWeekUrl: "https://www.tech-week.com",
  timeZone: "America/Los_Angeles",
  date: eventDate,
  startsAt,
  endsAt,
  dateLabel: {
    es: "Miércoles 7 de octubre, 2026",
    en: "Wednesday, October 7, 2026",
  },
  timeLabel: {
    es: "10:00 a.m. – 3:00 p.m. PT",
    en: "10:00 AM – 3:00 PM PT",
  },
  venue: {
    name: {
      es: "Consulado General de Colombia en San Francisco",
      en: "Consulate General of Colombia in San Francisco",
    },
    shortName: {
      es: "Consulado de Colombia",
      en: "Colombian Consulate",
    },
    street: "111 Pine Street, Suite 1400",
    city: "San Francisco, CA 94111",
    neighborhood: "Financial District",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=111+Pine+Street+Suite+1400+San+Francisco+CA+94111",
  },
} as const;

export const venueAddress = `${summit.venue.street}, ${summit.venue.city}`;

export const calendarDescription: Localized = {
  es: `Un encuentro en español e inglés que conecta a la comunidad tech de Latinoamérica con Silicon Valley. Registro: ${summit.registrationUrl}`,
  en: `A bilingual (English and Spanish) gathering that connects Latin America's tech community with Silicon Valley. Register: ${summit.registrationUrl}`,
};

export const googleCalendarUrl = (lang: Locale) =>
  `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: `${summit.name} ${summit.hashtag}`,
    dates: "20261007T170000Z/20261007T220000Z",
    details: calendarDescription[lang],
    location: `${summit.venue.name[lang]}, ${venueAddress}`,
  })}`;

// ratio: width / height. scale: optical correction for dense marks (seals).
export type Logo = { src: string; ratio: number; scale?: number };

export type Company = {
  name: string;
  logo: string;
  url: string;
  // Width / height. Square symbols get a text label next to them.
  ratio: number;
  scale?: number;
};

export const companies = {
  openai: {
    name: "OpenAI",
    logo: "/images/logos/openai.svg",
    url: "https://openai.com",
    ratio: 1,
  },
} satisfies Record<string, Company>;

export type Consulate = {
  code: string;
  country: Localized;
  name: Localized;
  shortName: Localized;
  flag: string;
  // The consulate's own mark in San Francisco (Chile's uses the Foreign
  // Ministry's). Prepared by scripts/prepare-logos.mjs where noted there.
  logo: Logo;
};

const consulate = (
  code: string,
  country: Localized,
  name: Localized,
  ratio: number,
): Consulate => ({
  code,
  country,
  name,
  shortName: {
    es: `Consulado de ${country.es}`,
    en: `Consulate of ${country.en}`,
  },
  flag: `/images/flags/${code}.webp`,
  logo: { src: `/images/consulates/${code}.webp`, ratio },
});

export const consulates: Consulate[] = [
  consulate(
    "co",
    { es: "Colombia", en: "Colombia" },
    {
      es: "Consulado General de Colombia en San Francisco",
      en: "Consulate General of Colombia in San Francisco",
    },
    2.419,
  ),
  consulate(
    "pe",
    { es: "Perú", en: "Peru" },
    {
      es: "Consulado General del Perú en San Francisco",
      en: "Consulate General of Peru in San Francisco",
    },
    1.226,
  ),
  consulate(
    "cl",
    { es: "Chile", en: "Chile" },
    {
      es: "Consulado General de Chile en San Francisco",
      en: "Consulate General of Chile in San Francisco",
    },
    1.1,
  ),
  consulate(
    "uy",
    { es: "Uruguay", en: "Uruguay" },
    {
      es: "Consulado General de Uruguay en San Francisco",
      en: "Consulate General of Uruguay in San Francisco",
    },
    2.706,
  ),
  consulate(
    "br",
    { es: "Brasil", en: "Brazil" },
    {
      es: "Consulado General de Brasil en San Francisco",
      en: "Consulate General of Brazil in San Francisco",
    },
    2.191,
  ),
  consulate(
    "mx",
    { es: "México", en: "Mexico" },
    {
      es: "Consulado General de México en San Francisco",
      en: "Consulate General of Mexico in San Francisco",
    },
    3.525,
  ),
  consulate(
    "gt",
    { es: "Guatemala", en: "Guatemala" },
    {
      es: "Consulado General de Guatemala en San Francisco",
      en: "Consulate General of Guatemala in San Francisco",
    },
    1,
  ),
];

export function consulateByCode(code: string) {
  const found = consulates.find((candidate) => candidate.code === code);
  if (!found) throw new Error(`Unknown consulate: ${code}`);
  return found;
}

export type Partner = {
  name: string;
  shortName: string;
  url: string;
  logo: Logo;
};

// Supporters: logos prepared by scripts/prepare-logos.mjs.
export const supporters: Partner[] = [
  {
    name: "Hispanic Chambers of Commerce of San Francisco",
    shortName: "HCCSF",
    url: "https://hccsf.com",
    logo: { src: "/images/supporters/hccsf.webp", ratio: 0.967, scale: 1.3 },
  },
  {
    name: "Ivy",
    shortName: "Ivy",
    url: "https://ivy.com.co",
    logo: { src: "/images/supporters/ivy.webp", ratio: 0.49 },
  },
  {
    name: "Torrenegra & Co",
    shortName: "Torrenegra & Co",
    url: "https://www.torrenegra.consulting",
    logo: { src: "/images/supporters/torrenegra.svg", ratio: 8.821 },
  },
  {
    name: "Torre.ai",
    shortName: "Torre.ai",
    url: "https://torre.ai",
    logo: { src: "/images/supporters/torre.webp", ratio: 4.592 },
  },
];

// Portraits: LinkedIn profile photos framed by scripts/prepare-people.mjs.
const photo = (id: string) => `/images/people/${id}.webp`;

export type Speaker = {
  id: string;
  name: string;
  role: Localized;
  org: string;
  bio: Localized;
  // Agenda slot the speaker is part of.
  session: string;
  image?: string;
  linkedin?: string;
  // Logo shown on the portrait while the person is still to be announced.
  company?: Company;
  status?: "tba";
};

// In agenda order: the grid reads one session per row on desktop.
export const speakers: Speaker[] = [
  {
    id: "luisa-dalla-costa",
    name: "Luisa Dalla Costa",
    role: { es: "Partner", en: "Partner" },
    org: "Latitud",
    bio: {
      es: "Invierte en founders de Latinoamérica desde Latitud, el fondo pre-seed y fellowship que conecta la región con Silicon Valley. Antes, Positive Ventures e Inventa.",
      en: "Backs Latin American founders at Latitud, the pre-seed fund and fellowship connecting the region with Silicon Valley. Previously at Positive Ventures and Inventa.",
    },
    session: "panel-investment",
    image: photo("luisa-dalla-costa"),
    linkedin: "https://www.linkedin.com/in/luisadallacosta/",
  },
  {
    id: "maria-gracia-lagos",
    name: "María Gracia Lagos",
    role: { es: "Associate", en: "Associate" },
    org: "Copec WIND Ventures",
    bio: {
      es: "Invierte en startups desde Copec WIND Ventures, el brazo de venture capital de Copec. Ingeniera de la Pontificia Universidad Católica de Chile, hoy en San Francisco.",
      en: "Invests in startups at Copec WIND Ventures, Copec's venture capital arm. An engineer from Pontificia Universidad Católica de Chile, now based in San Francisco.",
    },
    session: "panel-investment",
    image: photo("maria-gracia-lagos"),
    linkedin: "https://www.linkedin.com/in/mgracialagos/",
  },
  {
    id: "paolo-privitera",
    name: "Paolo Privitera",
    role: { es: "EVP Corporate Development", en: "EVP, Corporate Development" },
    org: "Events.com",
    bio: {
      es: "Lidera el desarrollo corporativo de Events.com. Antes cofundó Evensi. Egresado del MIT Sloan.",
      en: "Leads corporate development at Events.com. Previously cofounded Evensi. MIT Sloan alum.",
    },
    session: "panel-investment",
    image: photo("paolo-privitera"),
    linkedin: "https://www.linkedin.com/in/paoloprivitera/",
  },
  {
    id: "nicolas-lopez",
    name: "Nicolás López",
    role: { es: "Cofundador y CPO", en: "Cofounder & CPO" },
    org: "Horizon",
    bio: {
      es: "Cofundador y CPO de Horizon. Uruguayo, formado en la Universidad ORT.",
      en: "Cofounder and CPO of Horizon. Uruguayan, trained at Universidad ORT.",
    },
    session: "panel-talent",
    image: photo("nicolas-lopez"),
    linkedin: "https://www.linkedin.com/in/nicolaslopez1000/",
  },
  {
    id: "juan-pablo-linares",
    name: "Juan Pablo Linares",
    role: { es: "Cofundador y CEO", en: "Cofounder & CEO" },
    org: "Blinka",
    bio: {
      es: "Cofundador y CEO de Blinka. Pasó por Stanford GSB y por Antler.",
      en: "Cofounder and CEO of Blinka. Stanford GSB and Antler alum.",
    },
    session: "panel-talent",
    image: photo("juan-pablo-linares"),
    linkedin: "https://www.linkedin.com/in/juan-pablo-linares-uscher/",
  },
  {
    id: "victor-laguna",
    name: "Victor Laguna",
    role: { es: "Fundador y CEO", en: "Founder & CEO" },
    org: "PathPilot",
    bio: {
      es: "Fundador y CEO de PathPilot (YC S24), que construye agentes de IA para operaciones de crédito. Antes, en Meta. Estudió en la PUCP.",
      en: "Founder and CEO of PathPilot (YC S24), building AI agents for lending operations. Previously at Meta. Studied at PUCP in Lima.",
    },
    session: "panel-talent",
    image: photo("victor-laguna"),
    linkedin: "https://www.linkedin.com/in/vlaguna/",
  },
  {
    id: "nicolas-loeff",
    name: "Nicolás Loeff",
    role: { es: "Cofundador y CTO", en: "Cofounder & CTO" },
    org: "Zapia",
    bio: {
      es: "Cofundador y CTO de Zapia. Doctor por la University of Illinois Urbana-Champaign.",
      en: "Cofounder and CTO of Zapia. PhD from the University of Illinois Urbana-Champaign.",
    },
    session: "panel-product",
    image: photo("nicolas-loeff"),
    linkedin: "https://www.linkedin.com/in/nloeff/",
  },
  {
    id: "openai",
    name: "OpenAI",
    role: { es: "Engineer", en: "Engineer" },
    org: "OpenAI",
    bio: {
      es: "Una persona del equipo de ingeniería de OpenAI se suma a la conversación sobre cómo se construye producto con IA.",
      en: "An engineer from OpenAI joins the conversation on how product gets built with AI.",
    },
    session: "panel-product",
    company: companies.openai,
    status: "tba",
  },
  {
    id: "luis-hector-chavez",
    name: "Luis Héctor Chávez",
    role: { es: "CTO", en: "CTO" },
    org: "Replit",
    bio: {
      es: "CTO de Replit desde 2024. Antes, ingeniero en Google (Chrome y Android en ChromeOS) y Microsoft. Estudió en el Tec de Monterrey y en Stanford.",
      en: "CTO of Replit since 2024. Previously an engineer at Google (Chrome and Android on ChromeOS) and Microsoft. Studied at Tec de Monterrey and Stanford.",
    },
    session: "fireside",
    image: photo("luis-hector-chavez"),
    linkedin: "https://www.linkedin.com/in/lhchavez/",
  },
];

export type Organizer = {
  id: string;
  name: string;
  role: Localized;
  // Consulate code, or the organisation's name for everyone else.
  consulate?: string;
  org?: string;
  image?: string;
  linkedin: string;
};

// Consuls first, then their teams, then the community organizers.
export const organizers: Organizer[] = [
  {
    id: "sonia-pereira",
    name: "Sonia Pereira Portilla",
    role: { es: "Cónsul General", en: "Consul General" },
    consulate: "co",
    image: photo("sonia-pereira"),
    linkedin: "https://www.linkedin.com/in/sonia-pereira-969b2471/",
  },
  {
    id: "beatriz-silva",
    name: "Beatriz Silva Prestinari",
    role: { es: "Cónsul General", en: "Consul General" },
    consulate: "uy",
    image: photo("beatriz-silva"),
    linkedin: "https://www.linkedin.com/in/beatriz-silva-prestinari-165b71a3/",
  },
  {
    id: "sergio-zapata",
    name: "Sergio Zapata Huamán",
    role: { es: "Cónsul General Adjunto", en: "Deputy Consul General" },
    consulate: "pe",
    image: photo("sergio-zapata"),
    linkedin:
      "https://www.linkedin.com/in/sergio-an%C3%ADbal-zapata-huam%C3%A1n-3290b1332/",
  },
  {
    id: "ursula-rojas",
    name: "Ursula Rojas Weiser",
    role: { es: "Cónsul de Asuntos Económicos", en: "Consul for Economic Affairs" },
    consulate: "mx",
    image: photo("ursula-rojas"),
    linkedin: "https://www.linkedin.com/in/ursula-rojas-weiser/",
  },
  {
    id: "ivy-martinez",
    name: "Ivy Martinez",
    role: {
      es: "Líder de Iniciativas Estratégicas y Asuntos Públicos",
      en: "Strategic Initiatives & Public Affairs Lead",
    },
    consulate: "co",
    image: photo("ivy-martinez"),
    linkedin: "https://www.linkedin.com/in/ivymar/",
  },
  {
    id: "yulian-carrillo",
    name: "Yulian Carrillo Vargas",
    role: { es: "Equipo consular", en: "Consular team" },
    consulate: "co",
    image: photo("yulian-carrillo"),
    linkedin: "https://www.linkedin.com/in/yulian-manuel-carrillo-vargas-141a11320/",
  },
  {
    id: "alexander-torrenegra",
    name: "Alexander Torrenegra",
    role: { es: "Fundador y CEO", en: "Founder & CEO" },
    org: "Torre.ai",
    image: photo("alexander-torrenegra"),
    linkedin: "https://www.linkedin.com/in/alextorrenegra/",
  },
  {
    id: "alan-arguello",
    name: "Alan Argüello",
    role: { es: "Entrepreneur in Residence", en: "Entrepreneur in Residence" },
    org: "Emma Group",
    image: photo("alan-arguello"),
    linkedin: "https://www.linkedin.com/in/alan-arguello/",
  },
];

export type AgendaItem = {
  id: string;
  // 24h local time in San Francisco.
  start: string;
  end?: string;
  kind: Localized;
  title: Localized;
  description?: Localized;
  speakers?: string[];
  highlight?: boolean;
  showFlags?: boolean;
};

export const agenda: AgendaItem[] = [
  {
    id: "arrival",
    start: "10:00",
    end: "10:45",
    kind: { es: "Llegada", en: "Arrival" },
    title: {
      es: "Llegada de invitados y brunch",
      en: "Guest arrival & brunch",
    },
    description: {
      es: "Registro, café y brunch para empezar a conectar.",
      en: "Check-in, coffee and brunch to start connecting.",
    },
  },
  {
    id: "welcome",
    start: "10:45",
    end: "11:00",
    kind: { es: "Bienvenida", en: "Welcome" },
    title: {
      es: "Bienvenida de los consulados y aliados",
      en: "Welcome remarks from the consulates and partners",
    },
    description: {
      es: "Palabras de los siete consulados latinoamericanos en San Francisco y de los aliados que hacen posible el summit.",
      en: "Opening words from the seven Latin American consulates in San Francisco and the partners behind the summit.",
    },
    showFlags: true,
  },
  {
    id: "panel-investment",
    start: "11:00",
    end: "11:45",
    kind: { es: "Panel 1", en: "Panel 1" },
    title: {
      es: "El panorama de inversión y las oportunidades en LATAM",
      en: "The Investment Landscape and Opportunities in LATAM",
    },
    description: {
      es: "Dónde está el capital, qué buscan hoy los inversionistas y qué oportunidades se abren para los founders de la región.",
      en: "Where the capital is, what investors look for today, and the opportunities opening up for founders from the region.",
    },
    speakers: ["luisa-dalla-costa", "maria-gracia-lagos", "paolo-privitera"],
    highlight: true,
  },
  {
    id: "panel-talent",
    start: "12:00",
    end: "12:45",
    kind: { es: "Panel 2", en: "Panel 2" },
    title: {
      es: "Talento latinoamericano en San Francisco",
      en: "LATAM Talent in San Francisco",
    },
    description: {
      es: "Qué se necesita para llegar, armar equipo y crecer en San Francisco, contado por founders latinoamericanos que lo están haciendo.",
      en: "What it takes to get here, build a team and grow in San Francisco, from Latin American founders doing it right now.",
    },
    speakers: ["nicolas-lopez", "juan-pablo-linares", "victor-laguna"],
    highlight: true,
  },
  {
    id: "break",
    start: "12:45",
    end: "13:30",
    kind: { es: "Break", en: "Break" },
    title: { es: "Break y networking", en: "Break & networking" },
    description: {
      es: "Tiempo para comer algo y seguir la conversación.",
      en: "Time to grab a bite and keep the conversation going.",
    },
  },
  {
    id: "panel-product",
    start: "13:30",
    end: "14:15",
    kind: { es: "Panel 3", en: "Panel 3" },
    title: {
      es: "Ingeniería de producto con IA",
      en: "Product Engineering with AI",
    },
    description: {
      es: "Cómo cambia la forma de diseñar, construir y lanzar producto cuando la IA está en el centro del equipo.",
      en: "How designing, building and shipping product changes when AI sits at the center of the team.",
    },
    speakers: ["nicolas-loeff", "openai"],
    highlight: true,
  },
  {
    id: "fireside",
    start: "14:15",
    end: "15:00",
    kind: { es: "Fireside chat", en: "Fireside chat" },
    title: {
      es: "Fireside chat con Luis Héctor Chávez, CTO de Replit",
      en: "Fireside Chat with Luis Héctor Chávez, CTO of Replit",
    },
    description: {
      es: "Una conversación sobre construir en la frontera de la IA con quien lidera la tecnología de Replit.",
      en: "A conversation about building at the frontier of AI with the engineer leading technology at Replit.",
    },
    speakers: ["luis-hector-chavez"],
    highlight: true,
  },
  {
    id: "closing",
    start: "15:00",
    kind: { es: "Cierre", en: "Closing" },
    title: { es: "Cierre", en: "Closing" },
  },
];

export const themes = [
  {
    icon: "spark",
    title: { es: "El cambio tecnológico", en: "The technology shift" },
    text: {
      es: "Cómo la IA está transformando Latinoamérica, y qué hacer al respecto.",
      en: "How AI is transforming Latin America, and what to do about it.",
    },
  },
  {
    icon: "globe",
    title: { es: "Compañías globales", en: "Global companies" },
    text: {
      es: "Qué se necesita para construir una compañía global desde la región.",
      en: "What it takes to build a global company from the region.",
    },
  },
  {
    icon: "capital",
    title: { es: "Capital y redes", en: "Capital and networks" },
    text: {
      es: "El capital, las redes y las oportunidades para competir en el mundo.",
      en: "The capital, networks and opportunities to compete worldwide.",
    },
  },
  {
    icon: "people",
    title: { es: "Conexiones reales", en: "Real connections" },
    text: {
      es: "Founders, inversionistas, operadores y builders en un mismo lugar.",
      en: "Founders, investors, operators and builders in one room.",
    },
  },
] as const;

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const periods: Localized<[string, string]> = {
  es: ["a.m.", "p.m."],
  en: ["AM", "PM"],
};

function formatClock(time: string, lang: Locale) {
  const minutes = toMinutes(time);
  const hours = Math.floor(minutes / 60);
  const clock = `${((hours + 11) % 12) + 1}:${String(minutes % 60).padStart(2, "0")}`;
  return { clock, period: periods[lang][hours < 12 ? 0 : 1] };
}

export function formatTimeRange(start: string, end: string | undefined, lang: Locale) {
  const from = formatClock(start, lang);
  if (!end) return `${from.clock} ${from.period}`;
  const to = formatClock(end, lang);
  return from.period === to.period
    ? `${from.clock} – ${to.clock} ${to.period}`
    : `${from.clock} ${from.period} – ${to.clock} ${to.period}`;
}

export function speakerById(id: string) {
  const speaker = speakers.find((candidate) => candidate.id === id);
  if (!speaker) throw new Error(`Unknown speaker: ${id}`);
  return speaker;
}

export function agendaById(id: string) {
  const item = agenda.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown agenda item: ${id}`);
  return item;
}
