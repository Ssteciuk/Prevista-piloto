# Recorrido con IA (Higgsfield)

Cinco renders, cinco paradas: esquina → fachada → living y cocina → comedor → living con escalera.
Los fotogramas de `fotogramas/` ya están recortados a 16:9 y a 1920×1080: subí esos, no los originales.

## Configuración para todos los clips

- **Modelo:** el mismo para los 5 clips, si no se nota el cambio de "mano" entre tramos. Recomendado
  **MiniMax H3** (lo usó midudev) o **Seedance 2.0** (modo `fast` a 720p si el plan no tiene `std`).
- **Relación de aspecto:** 16:9. **Duración:** 6 s. **Audio:** apagado (`generate_audio: false` / `sound: off`).
- En cada clip: el fotograma de **inicio** va como *start frame* y el de **fin** como *end frame*.
- Todos los prompts terminan con la misma frase de estilo para que la cámara se comporte igual en los cinco.

Frase de estilo (va al final de cada prompt):

> Smooth architectural walkthrough, steady gimbal camera at eye level, slow constant speed, no cuts, no people
> appearing, no text, photorealistic, keep the exact materials, furniture and lighting of the reference frames.

## Clips

| # | Inicio | Fin | Prompt |
|---|---|---|---|
| 1 | `01-esquina` | `02-fachada` | The camera glides along the sidewalk around the corner of the building, turning slowly to face the wooden facade straight on. |
| 2 | `02-fachada` | `03-living-cocina` | The camera walks straight toward the black slatted gate of the ground floor unit, passes through it as the slats fill the frame, and arrives inside the living room looking toward the kitchen and the barred window. |
| 3 | `03-living-cocina` | `04-comedor` | The camera moves forward past the sofa to the dining table, then pans left to reveal the tall wooden kitchen cabinets and the living area behind. |
| 4 | `04-comedor` | `05-living-escalera` | The camera walks past the dining table into the living room and turns to face the dark wooden slatted wall, the pendant lamp and the staircase. |
| 5 | `05-living-escalera` | (sin fin) | The camera slowly pushes in toward the staircase, as if about to walk up to the next floor. |

El clip 5 es el último tramo: solo lleva *start frame*.

**Por qué el clip 2 pasa por la reja:** la entrada esconde el corte entre exterior e interior. Mientras los listones
negros llenan la pantalla, el modelo puede cambiar de escena sin que se vea un salto. Es el mismo recurso que vamos a
usar para pasar a la planta alta: la cámara pasa por detrás de los listones de madera del living o sube la escalera y
aparece en el dormitorio.

## Después de generar

Cuando estén los 5, avisame (o subilos al chat). Los uno en un master, los corto con `pnpm recorrido` y reemplazan al
recorrido provisorio en la web. Si un clip sale mal (la cámara retrocede, aparece gente o cambia un mueble), se
regenera solo ese.
