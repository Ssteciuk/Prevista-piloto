#!/usr/bin/env bash
# Corta un vídeo de recorrido en tramos listos para el scroll y saca el póster de cada uno.
#
#   pnpm recorrido <master.mp4> "<segundo de cada parada>" [ancho]
#   pnpm recorrido media/master.mp4 "0 6.5 13 21 27"
#
# Cada parada tiene su tramo: va desde su segundo hasta el de la siguiente. El último llega al final del vídeo.
# Sale en public/video/tramo-N.mp4 y public/recorrido/tramo-N.webp (primer fotograma, se ve mientras carga el vídeo).
#
# El master puede venir de Lumion, Twinmotion, D5, Enscape, un drone, una cámara con gimbal o de clips hechos con IA
# ya unidos. Lo único que importa es que sea UN plano continuo: la cámara no corta entre parada y parada.
set -euo pipefail

master=${1:?Falta el vídeo master}
read -r -a cortes <<< "${2:?Faltan los segundos de cada parada, por ejemplo \"0 6 12 18\"}"
ancho=${3:-1920}

raiz=$(cd "$(dirname "$0")/.." && pwd)
videos="$raiz/public/video"
posters="$raiz/public/recorrido"
mkdir -p "$videos" "$posters"
rm -f "$videos"/tramo-*.mp4 "$posters"/tramo-*.webp

duracion=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$master")
n=${#cortes[@]}

for ((i = 0; i < n; i++)); do
  desde=${cortes[$i]}
  hasta=${cortes[$((i + 1))]:-$duracion}
  num=$((i + 1))
  out="$videos/tramo-$num.mp4"
  echo "Tramo $num: $desde s → $hasta s"

  # Un keyframe cada 6 fotogramas para que buscar con el scroll sea instantáneo. El color va marcado como BT.709
  # con curva sRGB: sin esa marca el navegador pinta el vídeo más claro que el póster y el cambio se nota.
  ffmpeg -v error -y -ss "$desde" -to "$hasta" -i "$master" -an \
    -vf "scale='min($ancho,iw)':-2:flags=lanczos" \
    -c:v libx264 -preset slow -crf 26 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
    -color_primaries bt709 -color_trc iec61966-2-1 -colorspace bt709 -color_range tv \
    -movflags +faststart+write_colr "$out"

  # El póster sale del propio tramo ya codificado, así coincide píxel a píxel con su primer fotograma.
  ffmpeg -v error -y -i "$out" -frames:v 1 \
    -vf "scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24" \
    -c:v libwebp -quality 82 "$posters/tramo-$num.webp"
done

echo
du -h "$videos"/tramo-*.mp4 "$posters"/tramo-*.webp
echo "Listo: $n tramos. Revisa que src/data/proyecto.ts tenga $n paradas en recorrido.paradas."
