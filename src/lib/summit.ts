// Single source of truth for the event. Edit copy, agenda and speakers here.

export const summit = {
  name: "LATAM AI Summit",
  hashtag: "#SFTechWeek",
  registrationUrl: "https://partiful.com/e/5bUpcnTFJ3nZUXUIvVbe",
  techWeekUrl: "https://www.tech-week.com",
  timeZone: "America/Los_Angeles",
  // 7 Oct 2026 is PDT (UTC-7).
  date: "2026-10-07",
  startsAt: "2026-10-07T10:00:00-07:00",
  endsAt: "2026-10-07T15:00:00-07:00",
  dateLabel: "Miércoles 7 de octubre, 2026",
  timeLabel: "10:00 a.m. – 3:00 p.m. PT",
  venue: {
    name: "Consulado General de Colombia en San Francisco",
    shortName: "Consulado de Colombia",
    street: "111 Pine Street, Suite 1400",
    city: "San Francisco, CA 94111",
    neighborhood: "Financial District",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=111+Pine+Street+Suite+1400+San+Francisco+CA+94111",
  },
} as const;

export const venueAddress = `${summit.venue.street}, ${summit.venue.city}`;

export const calendarDescription = `Un encuentro en español que conecta a la comunidad tech de Latinoamérica con Silicon Valley. Registro: ${summit.registrationUrl}`;

export const googleCalendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams(
  {
    action: "TEMPLATE",
    text: `${summit.name} ${summit.hashtag}`,
    dates: "20261007T170000Z/20261007T220000Z",
    details: calendarDescription,
    location: `${summit.venue.name}, ${venueAddress}`,
  },
)}`;

export type Company = {
  name: string;
  logo: string;
  url: string;
  // Width / height. Wordmarks (ratio > 1) already include the name;
  // square symbols get a text label next to them.
  ratio: number;
  // Optical size correction so every mark reads at the same visual weight.
  scale?: number;
};

const company = (
  name: string,
  logo: string,
  url: string,
  ratio = 1,
  scale = 1,
): Company => ({ name, logo: `/images/logos/${logo}`, url, ratio, scale });

export const companies = {
  latitud: company("Latitud", "latitud.svg", "https://latitud.com", 121 / 36, 1.35),
  openai: company("OpenAI", "openai.svg", "https://openai.com"),
  replit: company("Replit", "replit.svg", "https://replit.com"),
  palantir: company("Palantir", "palantir.svg", "https://www.palantir.com"),
  figma: company("Figma", "figma.svg", "https://www.figma.com"),
  perplexity: company(
    "Perplexity",
    "perplexity.svg",
    "https://www.perplexity.ai",
  ),
  runway: company("Runway", "runway.svg", "https://runwayml.com", 84 / 19, 0.82),
} as const;

// Companies with a slot in the agenda vs. invited and still unconfirmed.
export const confirmedCompanies = [
  companies.latitud,
  companies.openai,
  companies.replit,
];
export const invitedCompanies = [
  companies.palantir,
  companies.figma,
  companies.perplexity,
  companies.runway,
];

export type Consulate = {
  country: string;
  name: string;
  flag: string;
  // Official mark supplied for the partner deck (or the ministry's own site).
  logo: { src: string; ratio: number };
  leads?: boolean;
};

const consulate = (
  code: string,
  country: string,
  name: string,
  ratio: number,
  leads = false,
): Consulate => ({
  country,
  name,
  flag: `/images/flags/${code}.webp`,
  logo: { src: `/images/consulates/${code}.webp`, ratio },
  leads,
});

export const consulates: Consulate[] = [
  consulate(
    "co",
    "Colombia",
    "Consulado General de Colombia en San Francisco",
    1.564,
    true,
  ),
  consulate("pe", "Perú", "Consulado General del Perú en San Francisco", 5.123),
  consulate("cl", "Chile", "Consulado General de Chile en San Francisco", 1.1),
  consulate("uy", "Uruguay", "Consulado de Uruguay en San Francisco", 2.706),
  consulate("br", "Brasil", "Consulado General de Brasil en San Francisco", 2.191),
  consulate("mx", "México", "Consulado General de México en San Francisco", 3.525),
  consulate(
    "gt",
    "Guatemala",
    "Consulado General de Guatemala en San Francisco",
    2.385,
  ),
];

export type Speaker = {
  id: string;
  name: string;
  role: string;
  org: string;
  company?: Company;
  bio: string;
  session: string;
  image?: string;
  linkedin?: string;
  // "tbc": invited, pending confirmation. "tba": slot confirmed, details pending.
  status?: "tbc" | "tba";
};

export const speakers: Speaker[] = [
  {
    id: "luisa-dalla-costa",
    name: "Luisa Dalla Costa",
    role: "Investment Associate",
    org: "Latitud",
    company: companies.latitud,
    bio: "Invierte en founders de Latinoamérica desde Latitud, fondo pre-seed y fellowship que conecta la región con Silicon Valley. Antes, Positive Ventures e Inventa.",
    session: "investment",
    image: "/images/speakers/luisa-dalla-costa.webp",
    linkedin: "https://www.linkedin.com/in/luisadallacosta/",
  },
  {
    // TODO: completar apellido, cargo, foto y LinkedIn de Paolo.
    id: "paolo",
    name: "Paolo",
    role: "",
    org: "Perfil por anunciar",
    bio: "Conversa con Luisa sobre el panorama de inversión y las oportunidades para construir desde Latinoamérica.",
    session: "investment",
    status: "tba",
  },
  {
    id: "openai",
    name: "Speaker de OpenAI",
    role: "",
    org: "OpenAI",
    company: companies.openai,
    bio: "Cómo se ve operar con la IA en el centro: equipos, producto y hábitos de quienes ya dieron el salto.",
    session: "ai-pilled",
    status: "tba",
  },
  {
    id: "luis-hector-chavez",
    name: "Luis Héctor Chávez",
    role: "CTO",
    org: "Replit",
    company: companies.replit,
    bio: "CTO de Replit desde 2024. Antes, ingeniero en Google (Chrome y Android en ChromeOS) y Microsoft. Estudió en el Tec de Monterrey y en Stanford.",
    session: "frontier",
    image: "/images/speakers/luis-hector-chavez.webp",
    linkedin: "https://www.linkedin.com/in/lhchavez/",
  },
  {
    id: "juan-carlos-niebles",
    name: "Juan Carlos Niebles",
    role: "VP of Research",
    org: "Samsung Research America · Stanford",
    bio: "Profesor adjunto de Computer Science en Stanford, donde codirige el Stanford Vision and Learning Lab. Antes, Research Director en Salesforce AI Research.",
    session: "frontier",
    image: "/images/speakers/juan-carlos-niebles.webp",
    linkedin: "https://www.linkedin.com/in/juan-carlos-niebles/",
    status: "tbc",
  },
];

export type AgendaItem = {
  id: string;
  // 24h local time in San Francisco.
  start: string;
  end?: string;
  kind: string;
  title: string;
  description?: string;
  host?: Company;
  speakers?: string[];
  invited?: Company[];
  highlight?: boolean;
  showFlags?: boolean;
};

export const agenda: AgendaItem[] = [
  {
    id: "arrival",
    start: "10:00",
    end: "10:45",
    kind: "Llegada",
    title: "Llegada de invitados y brunch",
    description: "Registro, café y brunch para empezar a conectar.",
  },
  {
    id: "welcome",
    start: "10:45",
    end: "11:00",
    kind: "Bienvenida",
    title: "Bienvenida de los consulados y aliados",
    description:
      "Palabras de los siete consulados latinoamericanos en San Francisco que hacen posible el summit.",
    showFlags: true,
  },
  {
    id: "investment",
    start: "11:00",
    end: "11:45",
    kind: "Fireside chat",
    title: "The investment landscape and opportunities in LATAM",
    description:
      "Dónde está el capital, qué buscan hoy los inversionistas y qué oportunidades se abren para los founders de la región.",
    host: companies.latitud,
    speakers: ["luisa-dalla-costa", "paolo"],
    highlight: true,
  },
  {
    id: "ai-pilled",
    start: "12:00",
    end: "12:45",
    kind: "Fireside chat",
    title: "How to become AI-Pilled",
    description:
      "Qué significa adoptar la IA de verdad: en tu equipo, en tu producto y en tu forma de trabajar.",
    host: companies.openai,
    speakers: ["openai"],
    invited: [companies.palantir, companies.figma, companies.perplexity],
    highlight: true,
  },
  {
    id: "break",
    start: "12:45",
    end: "13:30",
    kind: "Break",
    title: "Break y networking",
    description: "Tiempo para comer algo y seguir la conversación.",
  },
  {
    id: "frontier",
    start: "13:30",
    end: "14:15",
    kind: "Fireside chat",
    // Working title: the organizers can rename this session.
    title: "From LATAM to the AI frontier",
    description:
      "Latinoamericanos construyendo en la frontera de la IA: producto, investigación y lo que hace falta para competir desde cualquier lugar.",
    host: companies.replit,
    speakers: ["luis-hector-chavez", "juan-carlos-niebles"],
    invited: [companies.runway],
    highlight: true,
  },
  {
    id: "happy-hour",
    start: "14:15",
    end: "15:00",
    kind: "Happy hour",
    title: "Happy hour",
    description: "Conexiones entre founders, inversionistas, operadores y builders.",
  },
  {
    id: "closing",
    start: "15:00",
    kind: "Cierre",
    title: "Cierre",
  },
];

export const themes = [
  {
    icon: "spark",
    title: "El cambio tecnológico",
    text: "Cómo la IA está transformando Latinoamérica, y qué hacer al respecto.",
  },
  {
    icon: "globe",
    title: "Compañías globales",
    text: "Qué se necesita para construir una compañía global desde la región.",
  },
  {
    icon: "capital",
    title: "Capital y redes",
    text: "El capital, las redes y las oportunidades para competir en el mundo.",
  },
  {
    icon: "people",
    title: "Conexiones reales",
    text: "Founders, inversionistas, operadores y builders en un mismo lugar.",
  },
] as const;

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatClock(time: string) {
  const minutes = toMinutes(time);
  const hours = Math.floor(minutes / 60);
  const clock = `${((hours + 11) % 12) + 1}:${String(minutes % 60).padStart(2, "0")}`;
  return { clock, period: hours < 12 ? "a.m." : "p.m." };
}

export function formatTimeRange(start: string, end?: string) {
  const from = formatClock(start);
  if (!end) return `${from.clock} ${from.period}`;
  const to = formatClock(end);
  return from.period === to.period
    ? `${from.clock} – ${to.clock} ${to.period}`
    : `${from.clock} ${from.period} – ${to.clock} ${to.period}`;
}

export function speakerById(id: string) {
  const speaker = speakers.find((candidate) => candidate.id === id);
  if (!speaker) throw new Error(`Unknown speaker: ${id}`);
  return speaker;
}
