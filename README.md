# Prevista · landing con recorrido por scroll

Plantilla de landing para proyectos de arquitectura y emprendimientos inmobiliarios. La portada es un **recorrido por
un departamento que avanza y retrocede con la rueda del mouse**: la cámara entra por la puerta, pasa por la cocina, el
living, el dormitorio y sale al balcón, y en cada ambiente aparece su texto.

Es la misma técnica que la [landing de Arko de midudev](https://github.com/midudev/mcp-higgsfield-landing), adaptada a
obra. Viene cargada con **Casa Lumbre, un proyecto de ejemplo**: nombre, dirección, superficies y fechas son
ficticios, y el recorrido es una maqueta 3D renderizada con three.js para poder probar todo sin material del cliente.

**Stack:** Astro 7 · Tailwind CSS 4 · GSAP ScrollTrigger · Lenis · ffmpeg

## Puesta en marcha

Necesitás Node.js 22.12 o superior, pnpm y ffmpeg.

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

| Comando | Qué hace |
| :-- | :-- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Web estática en `dist/`, lista para subir a cualquier hosting |
| `pnpm recorrido <master.mp4> "<segundos>"` | Corta un vídeo de recorrido en tramos y saca los pósters |
| `pnpm demo:render` | Vuelve a renderizar el recorrido de maqueta en `media/demo/` |

## Cómo funciona el recorrido

```text
master.mp4 (un plano continuo) ──► pnpm recorrido ──► public/video/tramo-1…N.mp4 ──► src/scripts/recorrido.ts
  Lumion / Twinmotion / IA / gimbal     corte por parada      + public/recorrido/tramo-N.webp      scrub con el scroll
```

- **Una parada por ambiente, un tramo por parada.** El tramo N va de la parada N a la siguiente; el último sigue hasta
  el final de la sección. El texto de cada parada se queda abajo a la izquierda mientras la cámara avanza.
- **El scroll manda.** `recorrido.ts` convierte la posición del scroll en un valor continuo (0 en la primera parada,
  2,5 a mitad de camino entre la tercera y la cuarta) y fija el `currentTime` del tramo. No hay reproducción.
- **Pósters debajo.** El primer fotograma de cada tramo se ve mientras el vídeo carga y el cambio no se nota.
- **Carga por cercanía.** Los tramos se bajan de a uno, primero el actual y después el más cercano, y enteros (blob)
  para que buscar fotogramas no dependa de la red.
- **Celular.** El 16:9 se recorta en vertical; el campo `focus` de cada parada decide qué parte queda a la vista.
- **Sin vídeo cuando no corresponde.** Con "reducir movimiento" o ahorro de datos se ven solo los pósters.

## Proyecto nuevo, paso a paso

1. **Conseguí el vídeo**: un solo plano continuo que recorra la unidad y frene un instante en cada ambiente.
   - Del modelo 3D del estudio (Lumion, Twinmotion, D5, Enscape, SketchUp, Blender): 1920×1080, 24 fps, cámara a
     1,6 m, ease in/out en cada parada, 4 a 6 s por tramo. Es lo más fiel al proyecto.
   - Con IA a partir de renders: skill `scroll-world` (Higgsfield / Seedance), cada clip empieza en el último
     fotograma del anterior. Uní los clips en un master.
   - Filmado en showroom, unidad modelo u obra, con gimbal o drone.
2. **Cortalo**: `pnpm recorrido media/master.mp4 "0 5 10 15 20"` con el segundo de cada parada.
3. **Cargá los datos** en `src/data/proyecto.ts` (y poné `demo = false`) y el copy de cada ambiente en
   `src/components/Recorrido.astro`.
4. **Cambiá la URL** en `astro.config.mjs` y `seo.sitio`.
5. `pnpm build` y subí `dist/` (Cloudflare Pages, Netlify, Vercel o cualquier hosting estático).

Con Claude Code alcanza con pedirlo: la skill `recorrido-obra` (en `.claude/skills/`) tiene este proceso, y se apoya en
`landing-page-design` (diseño y copy) y `scroll-world` (vídeo con IA).

## Estructura

```text
src/
├── data/proyecto.ts         Todo el contenido: proyecto, paradas, unidades, obra, FAQ, contacto, SEO
├── components/
│   ├── Recorrido.astro      Escenario fijo con pósters y tramos, riel de ambientes y copy de cada parada
│   ├── Parada.astro         Una parada del recorrido
│   └── …                    Frase, Unidades, Terminaciones, Obra, Pasos, Ubicación, Faq, Contacto
├── scripts/
│   ├── recorrido.ts         Motor del scrub: scroll → currentTime, pósters y cola de carga
│   └── motion.ts            Lenis, apariciones, frase palabra por palabra, menú y navegación
├── layouts/Layout.astro
├── pages/                   index, legal y 404
└── styles/global.css        Paleta, tipografía y botones
public/
├── video/tramo-N.mp4        Tramos del recorrido, codificados para scrub
└── recorrido/tramo-N.webp   Pósters (primer fotograma de cada tramo)
scripts/preparar-recorrido.sh
tools/recorrido-demo/        Maqueta 3D del departamento de ejemplo y su render a vídeo
.claude/skills/              recorrido-obra, landing-page-design y scroll-world
```

## Detalles del vídeo

Para que buscar con el scroll sea fluido cada tramo lleva un keyframe cada 6 fotogramas (`-g 6`), y el color va
marcado como BT.709 con curva sRGB para que el navegador no lo pinte más claro que el póster. El script lo hace solo;
si hay que ajustar peso, subí `-crf` (26 por defecto) en `scripts/preparar-recorrido.sh`.

## Créditos

- Técnica y referencia: [midudev/mcp-higgsfield-landing](https://github.com/midudev/mcp-higgsfield-landing).
- Skills: [landing-page-design](https://github.com/elayadesign/ai-design-skills) (MIT, Elaya) y
  [scroll-world](https://github.com/oso95/scroll-world) (MIT), con sus licencias junto a cada una.
- Tipografía: Manrope (SIL OFL). Iconos: Phosphor.
