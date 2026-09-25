# LATAM AI Summit · San Francisco

Landing del LATAM AI Summit (#SFTechWeek): miércoles 7 de octubre de 2026, 10:00 a.m. – 3:00 p.m. PT, en el Consulado General de Colombia en San Francisco.

- Info del evento, agenda tentativa, speakers, compañías, consulados, fotos de eventos anteriores y ubicación.
- Todos los botones de registro llevan a Partiful: https://partiful.com/e/5bUpcnTFJ3nZUXUIvVbe
- Hero con el Golden Gate en ASCII (efecto linterna con el mouse), retratos con hover ASCII, cuenta regresiva y agenda que marca la sesión "Ahora" durante el evento.
- Botones para Google Calendar y archivo `.ics` (Apple / Outlook), generado en `/latam-ai-summit.ics`.
- 100 % estático: sin base de datos ni variables secretas.

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

- **Todo el contenido** (fecha, lugar, link de registro, agenda, speakers, compañías, consulados, fotos): `src/lib/summit.ts`.
- Estructura de la página: `src/app/page.tsx`. Estilos: `src/app/summit.css`.
- Imagen para compartir (Open Graph) y favicon: `npm run og` regenera `public/images/opengraph.png` y `src/app/icon.png`. Córrelo si cambias fecha, lugar o título.
- Fotos de speakers: `public/images/speakers/` (formato 4:5). Logos: `public/images/logos/` (SVG blanco).

## Pendientes de contenido

- **Paolo**: falta apellido, cargo, foto y LinkedIn (tarjeta marcada "Por anunciar" en `src/lib/summit.ts`).
- **Speaker de OpenAI**: por anunciar.
- **Por confirmar**: Juan Carlos Niebles, Runway, Palantir, Figma y Perplexity.
- **Título de la sesión de la 1:30 p.m.**: "From LATAM to the AI frontier" es un título de trabajo.
- **Hora de cierre**: la agenda termina a las 3:00 p.m.; el evento en Partiful dice 4:00 p.m.

Créditos de fotos y logos: `public/images/CREDITS.md`.
