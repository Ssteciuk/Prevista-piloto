# Prevista · landing con recorrido por scroll

- Para una landing de un proyecto nuevo o para cambiar vídeos/paradas, seguí `.claude/skills/recorrido-obra/SKILL.md`.
- Diseño y copy: `.claude/skills/landing-page-design/SKILL.md` (una tipografía, escala de Tailwind, sin guiones en el copy,
  curva `--ease-fluid` en toda transición, apariciones con IntersectionObserver).
- El contenido vive en `src/data/proyecto.ts`; el copy de cada parada en `src/components/Recorrido.astro`.
- No inventar datos de un proyecto real (precios, m², fechas). Lo que falte se marca y se avisa.
- Copy en español rioplatense, voseo.
- Antes de commitear: `pnpm build`.
