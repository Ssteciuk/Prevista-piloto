---
name: recorrido-obra
description: Arma o adapta en este repo una landing de un proyecto de arquitectura o un emprendimiento inmobiliario con un recorrido por un departamento que avanza y retrocede con el scroll. Úsala cuando pidan una landing nueva para una obra, cambiar el proyecto cargado, preparar o reemplazar los vídeos del recorrido, o sumar o quitar paradas (ambientes).
---

# Recorrido de obra con scroll

La landing ya está hecha: Astro + Tailwind + GSAP ScrollTrigger + Lenis. Un proyecto nuevo es **datos + vídeo**, no código.
Para el diseño y el copy manda `landing-page-design`. Para generar los vídeos con IA, `scroll-world` (arquitectura A,
"one continuous walkthrough", es la que va con interiores realistas).

## 1. Intake (una sola tanda de preguntas, lo que falte)

- Proyecto: nombre, barrio y dirección, desarrolladora, estudio, fecha de entrega, % de avance, pisos y unidades.
- Unidad del recorrido: cuál es y qué ambientes se recorren, en orden de caminata (4 a 6 paradas).
- Por cada parada: un dato concreto que se vea en el vídeo (m², orientación, altura, equipamiento).
- Tipologías: m² cubiertos, balcón, orientación, disponibles.
- Contacto: WhatsApp, email, horario del showroom.
- De dónde sale el vídeo (paso 2).

Regla: si un dato no lo dio el cliente, no se inventa. Se deja el campo con un texto que diga que falta y se avisa.
Mientras el proyecto tenga datos de ejemplo, `demo = true` en `src/data/proyecto.ts`.

## 2. El vídeo: un solo plano continuo

El scroll solo mueve el tiempo de un vídeo. Lo que importa es que la cámara recorra la unidad **sin cortes** y que
**frene un instante en cada parada** (ahí se lee el texto). Tres caminos, del más fiel al más rápido:

1. **Exportado del modelo 3D** (Lumion, Twinmotion, D5 Render, Enscape, SketchUp, Blender). Es el mejor: medidas y
   aberturas reales. Pedir al estudio una animación de cámara a 1920×1080, 24 fps, ease in/out en cada parada,
   altura de ojos 1,55 a 1,65 m, lente de 24 a 28 mm (equivalente), giros lentos y sin cortes. 4 a 6 s por tramo.
2. **IA a partir de renders** (Higgsfield / Seedance con primer y último fotograma). Seguir `scroll-world`, arquitectura
   A: cada tramo empieza en el último fotograma real del anterior. Unir los clips en un master antes del paso 3.
3. **Filmado**: showroom, unidad modelo u obra terminada, con gimbal o drone, a ritmo de caminata constante.

Para probar sin material del cliente: `pnpm demo:render` genera un recorrido de maqueta (three.js) en `media/demo/`.

## 3. Cortar en tramos

```sh
pnpm recorrido media/master.mp4 "0 5 10 15 20"   # segundo en el que la cámara está en cada parada
```

Sale `public/video/tramo-N.mp4` (keyframe cada 6 fotogramas, color BT.709) y `public/recorrido/tramo-N.webp`
(póster = primer fotograma del tramo). El número de cortes tiene que ser igual al de paradas.

## 4. Datos y copy

- `src/data/proyecto.ts`: todo el contenido. `recorrido.paradas` en el mismo orden que los cortes. `focus` (0 a 100)
  elige qué parte del 16:9 queda a la vista en el celular: poné el foco donde está lo importante del ambiente.
- `src/components/Recorrido.astro`: el copy de cada parada (un `<Parada index={i}>` por parada).
- `astro.config.mjs` `site` y `seo.sitio`: la URL final.

## 5. Revisar antes de entregar

- `pnpm build` sin errores.
- `pnpm dev` y bajar despacio por el recorrido: no tiene que haber saltos al pasar de tramo ni entre póster y vídeo.
- En el celular (o el emulador del navegador a 390×844): que el foco de cada parada muestre lo importante.
- Con "reducir movimiento" activado se ven solo los pósters y el texto se lee igual.
- Pesos: cada tramo de 1080p debería quedar por debajo de ~4 MB. Si no, subir `-crf` en el script.
- Sin `demo` ni textos de ejemplo cuando el proyecto es real. El aviso legal del pie se mantiene.
