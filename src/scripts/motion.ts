import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initRecorrido } from './recorrido';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll suave sincronizado con ScrollTrigger: hace que el vídeo avance sin tirones con la rueda del mouse.
let lenis: Lenis | undefined;
if (!reduceMotion) {
  lenis = new Lenis({ autoRaf: false, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Apariciones al entrar en pantalla: IntersectionObserver, nunca un listener de scroll.
const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

// El recorrido por la unidad.
const seccion = document.querySelector<HTMLElement>('[data-recorrido]');
if (seccion) initRecorrido(seccion, reduceMotion);

// Frase grande: cada palabra pasa del tono apagado al pleno, una por una y en orden de lectura.
document.querySelectorAll<HTMLElement>('[data-palabras]').forEach((bloque) => {
  const palabras = [...bloque.querySelectorAll<HTMLElement>('[data-palabra]')];
  if (reduceMotion) {
    palabras.forEach((p) => p.classList.add('is-lit'));
    return;
  }
  ScrollTrigger.create({
    trigger: bloque,
    start: 'top 80%',
    end: 'bottom 45%',
    onUpdate: (self) => {
      const encendidas = Math.round(self.progress * palabras.length);
      palabras.forEach((p, i) => p.classList.toggle('is-lit', i < encendidas));
    },
  });
});

// Barras de avance de obra: se llenan al entrar en pantalla.
document.querySelectorAll<HTMLElement>('[data-avance]').forEach((barra) => {
  const valor = Number(barra.dataset.avance) / 100;
  if (reduceMotion) {
    barra.style.transform = `scaleX(${valor})`;
    return;
  }
  gsap.fromTo(barra, { scaleX: 0 }, { scaleX: valor, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: barra, start: 'top 90%' } });
});

// Menú móvil.
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const abrir = (abierto: boolean) => {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(abierto));
  menu.classList.toggle('is-open', abierto);
  if (abierto) lenis?.stop();
  else lenis?.start();
};
toggle?.addEventListener('click', () => abrir(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => abrir(false)));
document.addEventListener('keydown', (e) => e.key === 'Escape' && abrir(false));

// La navegación marca la sección en la que estás.
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-spy]')];
const espiar = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a) => a.setAttribute('aria-current', String(a.dataset.spy === `#${entry.target.id}`)));
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
new Set(navLinks.map((a) => a.dataset.spy)).forEach((sel) => {
  const el = sel && document.querySelector(sel);
  if (el) espiar.observe(el);
});
