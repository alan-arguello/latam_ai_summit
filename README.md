# LATAM AI Summit · San Francisco

Landing del LATAM AI Summit (#SFTechWeek): miércoles 7 de octubre de 2026, 10:00 a.m. – 3:00 p.m. PT, en el Consulado General de Colombia en San Francisco.

- En español (`/es`) e inglés (`/en`): info del evento, agenda, speakers, organizadores, logos oficiales de los 7 consulados, supporters (HCCSF, Ivy, Torrenegra & Co, Torre.ai) y ubicación.
- Todos los botones de registro llevan a Partiful: https://partiful.com/e/5bUpcnTFJ3nZUXUIvVbe
- Cuenta regresiva y agenda que marca la sesión "Ahora" durante el evento.
- Botones para Google Calendar y archivo `.ics` (Apple / Outlook) por idioma: `/es/latam-ai-summit.ics` y `/en/latam-ai-summit.ics`.
- Páginas estáticas: sin base de datos ni variables secretas. Solo `/` pasa por el proxy para elegir idioma.

## Idiomas (i18n)

- Cada página vive en `src/app/[lang]/` y se genera estática para `es` y `en` (`generateStaticParams`).
- `src/proxy.ts` redirige `/` (y cualquier ruta sin idioma, como el viejo `/latam-ai-summit.ics`) al idioma del visitante: primero la cookie `NEXT_LOCALE` (se guarda al usar el selector ES / EN), luego `Accept-Language`, y si no, español.
- Textos de interfaz: `src/i18n/dictionaries/es.ts` y `en.ts` (TypeScript exige que `en` tenga las mismas llaves que `es`). Contenido del evento con sus dos versiones (`{ es, en }`): `src/lib/summit.ts`.
- Cada idioma tiene su `canonical`, `hreflang` (es, en, x-default), Open Graph (`opengraph.png` / `opengraph-en.png`), sitemap con alternates y 404 propio.

## Design system

Inspirado en el lenguaje visual de elevenlabs.io: papel cálido (`#fdfcfc`), tinta negra, líneas finas de 1px como rieles de página, superficies redondeadas (24/20/14px) y fotografía real.

- Tipografía: Host Grotesk Light para display (la alternativa libre más cercana a Waldenburg, la fuente de ElevenLabs), Inter para texto y Geist Mono para horarios.
- Tokens y primitivos (botones, pills, cards, headings, marco): `src/app/design-system.css` y `src/components/ui.tsx`.
- Composición de la página: `src/app/summit.css`.

## Desarrollo

Node.js 22.18+ y npm.

```sh
npm ci
npm run dev -- --port 3107
```

## Deploy en Vercel

1. Sube esta carpeta a un repositorio nuevo en GitHub (sin `node_modules` ni `.next`, ya excluidos en `.gitignore`).
2. En Vercel: **Add New → Project**, importa el repo. Framework **Next.js**, directorio raíz `.`, Node.js 22.x. No cambies el build command.
3. Opcional: define `SITE_URL` con el dominio final (por ejemplo `https://latamaisummit.com`) para canonical, Open Graph y sitemap. Si no, se usa el dominio de producción de Vercel. Los previews de Vercel quedan `noindex`.

## Edición

- **Todo el contenido** (fecha, lugar, link de registro, agenda, speakers, organizadores, consulados, supporters): `src/lib/summit.ts`. Los speakers van en orden de agenda: en escritorio cada fila de la cuadrícula es una sesión.
- Estructura de la página: `src/app/[lang]/page.tsx`.
- Imagen para compartir (Open Graph) y favicon: `npm run og` regenera `public/images/opengraph.png`, `opengraph-en.png` y `src/app/icon.png`. Córrelo si cambias fecha, lugar o título.
- Fotos de speakers y organizadores: las originales (foto de perfil de LinkedIn, o una copia idéntica en mayor resolución) van en `assets/people/`. Para agregar a alguien: pon su foto ahí, corre `swift scripts/detect-faces.swift assets/people/*.jpg assets/people/*.webp > assets/people/faces.json` y luego `node scripts/prepare-people.mjs`, que recorta todas igual alrededor de la cara y las guarda en `public/images/people/`.
- Logos de consulados: `public/images/consulates/`; supporters (HCCSF, Ivy, Torrenegra & Co, Torre.ai): `public/images/supporters/`, con fondo transparente. Se preparan desde los originales (`assets/ascii-lineup/logos/`, `assets/supporters/`) con `node scripts/prepare-logos.mjs`.

## Pendientes de contenido

- **Speaker de OpenAI** (Panel 3): por anunciar. Cuando se confirme, agrega su foto y cambia `status: "tba"` en `src/lib/summit.ts`.
- **Hora de cierre**: la agenda termina a las 3:00 p.m.; el evento en Partiful dice 4:00 p.m.

Créditos de fotos y logos: `public/images/CREDITS.md`.
