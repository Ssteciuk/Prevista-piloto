import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Punto = { y: number; v: number };

// Interpola un valor por tramos según la posición de scroll.
const porTramos = (y: number, puntos: Punto[]) => {
  if (y <= puntos[0].y) return puntos[0].v;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    if (y <= b.y) return a.v + (b.v - a.v) * ((y - a.y) / (b.y - a.y || 1));
  }
  return puntos[puntos.length - 1].v;
};

const clamp = gsap.utils.clamp(0, 1);

// El scroll mueve la cámara: cada parada tiene un tramo de vídeo que va de ella a la siguiente y el scroll fija su
// currentTime. No hay reproducción, el vídeo solo avanza o retrocede cuando el visitante baja o sube.
//
// `w` es la posición en el recorrido: 0 en la primera parada, 1 en la segunda, 2,5 a mitad de camino entre la
// tercera y la cuarta. Al terminar la sección vale `paradas.length`, así el último tramo también tiene su recorrido.
export function initRecorrido(seccion: HTMLElement, reduceMotion: boolean) {
  const escenario = seccion.querySelector<HTMLElement>('[data-escenario]');
  if (!escenario) return;
  const paradas = [...seccion.querySelectorAll<HTMLElement>('[data-parada]')];
  const posters = [...escenario.querySelectorAll<HTMLElement>('[data-poster]')];
  const tramos = [...escenario.querySelectorAll<HTMLVideoElement>('[data-tramo]')];
  const links = [...escenario.querySelectorAll<HTMLAnchorElement>('[data-ir]')];
  const riel = escenario.querySelector<HTMLElement>('[data-riel]');
  const pista = escenario.querySelector<HTMLElement>('[data-pista]');
  const ultima = paradas.length - 1;
  const focus = paradas.map((p) => Number(p.dataset.focus ?? 50));

  // Cada parada llega cuando su artículo toca el borde superior de la pantalla.
  const marcas = paradas.map((p) => ScrollTrigger.create({ trigger: p, start: 'top top' }));
  const listo = tramos.map(() => false);
  let actual = -1;
  let w = 0;
  let activo = 0;
  let mostrado = -1;
  let tiempo = 0;

  const marcarActual = (i: number) => {
    if (i === actual) return;
    actual = i;
    paradas.forEach((p, k) => p.classList.toggle('is-current', k === i));
    links.forEach((a, k) => a.setAttribute('aria-current', String(k === i)));
  };

  // El tramo entra en cuanto buscó su fotograma. Si todavía no cargó, se ven los pósters.
  const mostrar = () => {
    if (mostrado !== activo) {
      mostrado = activo;
      tramos.forEach((v, k) => v.classList.toggle('is-shown', k === activo));
    }
    escenario.dataset.modo = 'video';
  };

  // Una búsqueda por vez: si el scroll se movió mientras el vídeo buscaba, al terminar busca la posición nueva.
  const sincronizar = () => {
    const video = tramos[activo];
    if (!video || !listo[activo]) {
      delete escenario.dataset.modo;
      return;
    }
    if (video.seeking) return;
    if (Math.abs(video.currentTime - tiempo) > 0.01) video.currentTime = tiempo;
    else mostrar();
  };

  tramos.forEach((video, i) =>
    video.addEventListener('seeked', () => {
      if (i !== activo) return;
      mostrar();
      sincronizar();
    }),
  );

  const pintar = (self: ScrollTrigger) => {
    const y = self.scroll();
    w = porTramos(y, [...marcas.map((m, i) => ({ y: m.start, v: i })), { y: self.end, v: paradas.length }]);
    const en = Math.min(w, ultima);

    marcarActual(Math.round(en));
    escenario.style.setProperty('--focus-x', `${porTramos(y, marcas.map((m, i) => ({ y: m.start, v: focus[i] })))}%`);
    if (riel) riel.style.transform = `scaleY(${en / ultima})`;
    if (pista) pista.style.opacity = String(clamp(1 - w * 4));

    // Pósters (debajo de los vídeos): cada uno está entero justo en su parada, que es donde empieza su tramo, así el
    // vídeo entra encima sin salto. Sin vídeo, aparecen en la segunda mitad del tramo anterior y se acercan un poco.
    posters.forEach((poster, i) => {
      poster.style.opacity = String(i === 0 ? 1 : clamp((w - i + 0.5) / 0.5));
      if (!reduceMotion) poster.style.transform = `scale(${1 + 0.06 * clamp(w - i)})`;
    });

    if (!tramos.length) return;
    activo = Math.min(tramos.length - 1, Math.floor(w));
    const { duration } = tramos[activo];
    if (listo[activo]) tiempo = Math.min((w - activo) * duration, duration - 0.05);
    sincronizar();
  };

  const seccionEntera = ScrollTrigger.create({
    trigger: seccion,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: pintar,
    onRefresh: pintar,
  });
  pintar(seccionEntera);

  // Con movimiento reducido o ahorro de datos quedan solo los pósters.
  const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (!tramos.length || reduceMotion || ahorro) return;

  // Los tramos se cargan de a uno: primero el actual y después el más cercano a la posición del scroll.
  // A igual distancia va primero el que viene adelante.
  const distancia = (i: number) => {
    if (i === activo) return -1;
    if (i > w) return i - w;
    return w - (i + 1) + 0.5;
  };
  const cola = tramos.map((_, i) => i);

  const cargarSiguiente = async () => {
    cola.sort((a, b) => distancia(a) - distancia(b));
    const i = cola.shift();
    if (i === undefined) return;
    const video = tramos[i];
    const src = video.dataset.src ?? '';
    video.preload = 'auto';

    // Cada tramo se baja entero (blob) para que buscar fotogramas no dependa de la red.
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(res.statusText);
      video.src = URL.createObjectURL(await res.blob());
    } catch {
      video.src = src;
    }

    const cargo = await new Promise<boolean>((resolve) => {
      video.addEventListener('loadeddata', () => resolve(true), { once: true });
      video.addEventListener('error', () => resolve(false), { once: true });
    });
    if (cargo) {
      // iOS no pinta los fotogramas buscados hasta que el vídeo se reprodujo una vez.
      await video.play().catch(() => {});
      video.pause();
      listo[i] = true;
      pintar(seccionEntera);
    }
    cargarSiguiente();
  };

  if (document.readyState === 'complete') cargarSiguiente();
  else window.addEventListener('load', cargarSiguiente, { once: true });
}
