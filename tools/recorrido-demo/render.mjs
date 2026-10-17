// Renderiza el recorrido de demo fotograma a fotograma en Chromium headless y lo une en un master con ffmpeg.
//   pnpm demo:render            → media/demo/master.mp4 y media/demo/tiempos.txt
//   pnpm demo:render --w 1920 --h 1080
// Después: pnpm recorrido media/demo/master.mp4 "$(cat media/demo/tiempos.txt)"
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const raiz = resolve(import.meta.dirname, '../..');
const salida = join(raiz, 'media/demo');
const frames = join(salida, 'frames');
const arg = (nombre, def) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const w = Number(arg('w', 1280));
const h = Number(arg('h', 720));

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    const cuerpo = await readFile(join(raiz, ruta));
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] ?? 'application/octet-stream' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const puerto = server.address().port;

await rm(frames, { recursive: true, force: true });
await mkdir(frames, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('pageerror', (e) => console.error(e));
await page.goto(`http://localhost:${puerto}/tools/recorrido-demo/index.html?w=${w}&h=${h}`);
await page.waitForFunction(() => window.listo === true, null, { timeout: 60_000 });
const { totalFrames, tiempos, paradas } = await page.evaluate(() => window.recorrido);

const inicio = Date.now();
for (let n = 0; n <= totalFrames; n++) {
  const url = await page.evaluate((i) => window.recorrido.frame(i), n);
  await writeFile(join(frames, `f${String(n).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  if (n % 24 === 0) process.stdout.write(`\r${n}/${totalFrames} fotogramas · ${Math.round((Date.now() - inicio) / 1000)} s`);
}
console.log();
await browser.close();
server.close();

execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '24', '-i', join(frames, 'f%05d.jpg'), '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', join(salida, 'master.mp4')], { stdio: 'inherit' });
// Los tiempos de cada parada (en segundos) son los puntos de corte del master.
await writeFile(join(salida, 'tiempos.txt'), tiempos.slice(0, paradas.length).join(' ') + '\n');
console.log(`Listo: media/demo/master.mp4 · paradas en ${tiempos.slice(0, paradas.length).join(', ')} s`);
