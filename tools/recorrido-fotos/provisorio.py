"""Recorrido provisorio a partir de renders o fotos fijas, sin IA.

Cada parada es una imagen. En su tramo la cámara se acerca despacio a un punto de la imagen y en el último segundo
se funde con la imagen siguiente, que arranca entera: así el último fotograma de un tramo coincide con el primero
del otro y el scroll no salta. Sirve para ver orden y ritmo con material real antes de generar los vídeos con IA.

    python3 tools/recorrido-fotos/provisorio.py tools/recorrido-fotos/ejemplo.json media/provisorio.mp4

El JSON es una lista de paradas, en orden:
    {"imagen": "media/fotos/4.webp", "foco": [0.5, 0.45], "hacia": [0.62, 0.6], "zoom": 1.25, "seg": 5}
- foco: centro vertical/horizontal del recorte 16:9 (0 a 1). Solo importa si la imagen no es 16:9.
- hacia: punto de la imagen recortada al que se acerca la cámara (0 a 1).
- zoom: cuánto se acerca al final del tramo (1 = nada).
- seg: duración del tramo. La última parada no se funde con nada.
Imprime los segundos de cada parada, listos para `pnpm recorrido`.
"""

import json
import subprocess
import sys

from PIL import Image

ANCHO, ALTO, FPS = 1920, 1080, 24
FUNDIDO = 1.0  # segundos


def recorte_16_9(ruta, foco):
    img = Image.open(ruta).convert('RGB')
    w, h = img.size
    if w / h > ANCHO / ALTO:
        nw = round(h * ANCHO / ALTO)
        x = round((w - nw) * foco[0])
        img = img.crop((x, 0, x + nw, h))
    else:
        nh = round(w * ALTO / ANCHO)
        y = round((h - nh) * foco[1])
        img = img.crop((0, y, w, y + nh))
    # Margen de resolución para acercarse sin que se note el pixelado.
    return img.resize((ANCHO * 2, ALTO * 2), Image.LANCZOS)


def suave(t):
    t = min(1.0, max(0.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def vista(img, hacia, zoom, t):
    """Encuadre de la cámara a una fracción t del acercamiento."""
    z = 1 + (zoom - 1) * suave(t)
    W, H = img.size
    cw, ch = W / z, H / z
    # El centro va del medio de la imagen al punto elegido, sin salirse del borde.
    cx = W / 2 + (hacia[0] * W - W / 2) * suave(t)
    cy = H / 2 + (hacia[1] * H - H / 2) * suave(t)
    cx = min(max(cx, cw / 2), W - cw / 2)
    cy = min(max(cy, ch / 2), H - ch / 2)
    caja = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return img.resize((ANCHO, ALTO), Image.BICUBIC, box=caja)


def main():
    paradas = json.load(open(sys.argv[1]))
    salida = sys.argv[2]
    imgs = [recorte_16_9(p['imagen'], p.get('foco', [0.5, 0.5])) for p in paradas]
    ffmpeg = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{ANCHO}x{ALTO}', '-r', str(FPS),
         '-i', '-', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', salida],
        stdin=subprocess.PIPE,
    )
    tiempos, t0 = [], 0.0
    for i, p in enumerate(paradas):
        tiempos.append(round(t0, 3))
        ultima = i == len(paradas) - 1
        n = round(p.get('seg', 5) * FPS)
        fundido = 0 if ultima else round(FUNDIDO * FPS)
        mover = n - fundido
        for f in range(mover):
            ffmpeg.stdin.write(vista(imgs[i], p['hacia'], p['zoom'], f / max(1, mover - 1)).tobytes())
        if not ultima:
            final = vista(imgs[i], p['hacia'], p['zoom'], 1)
            siguiente = vista(imgs[i + 1], [0.5, 0.5], 1, 0)
            for f in range(fundido):
                ffmpeg.stdin.write(Image.blend(final, siguiente, suave((f + 1) / fundido)).tobytes())
        t0 += n / FPS
    ffmpeg.stdin.close()
    ffmpeg.wait()
    print(' '.join(str(t) for t in tiempos))


if __name__ == '__main__':
    main()
