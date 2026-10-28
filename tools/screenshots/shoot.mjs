// Renders harness.html scenes in headless Edge and saves cropped PNGs.
// Usage: node tools/screenshots/shoot.mjs scene:theme[:width] ...   (writes docs/images/<scene>-<theme>.png)
// Needs Microsoft Edge; set EDGE to use another Chromium browser.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const EDGE = process.env.EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333;
const jobs = process.argv.slice(2);
const outdir = join(import.meta.dirname, '..', '..', 'docs', 'images');
const harness = pathToFileURL(join(import.meta.dirname, 'harness.html')).href;

const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-'))}`,
  '--allow-file-access-from-files', '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1400, deviceScaleFactor: 2, mobile: false });
for (const job of jobs) {
  const [scene, theme, width = '420'] = job.split(':');
  await send('Page.navigate', { url: `${harness}?scene=${scene}&theme=${theme}&width=${width}` });
  for (let i = 0; i < 50 && !(await evaluate('document.body && document.body.dataset.ready')); i++) await sleep(100);
  await sleep(600); // let transitions settle
  const r = await evaluate('(() => { const b = document.getElementById("wrap").getBoundingClientRect(); const kids = [...document.getElementById("wrap").children].map(c => c.getBoundingClientRect()); return { x: b.x, y: b.y, w: Math.max(...kids.map(k => k.right)) + 20 - b.x, h: Math.max(...kids.map(k => k.bottom)) + 20 - b.y }; })()');
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  const file = join(outdir, `${scene}-${theme}.png`);
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
  console.log(file, Math.round(r.w), 'x', Math.round(r.h));
}
ws.close();
edge.kill();
