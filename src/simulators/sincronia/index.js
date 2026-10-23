/**
 * "Quem é B1?": pulso carotídeo e bulhas no mesmo eixo de tempo.
 * O cursor percorre dois ciclos; ao cruzar B1 e B2 toca a bulha esquemática.
 * O pulso radial pode ser sobreposto para mostrar que chega atrasado.
 */
import { button, setIcon, prefersReducedMotion } from '../../core/ui.js';
import { thump, getContext } from '../../core/audio.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const T = 0.8, CIC = 2, W = 640, X0 = 20, X1 = 620;
const tx = (t) => X0 + (t / (T * CIC)) * (X1 - X0);
// pulso arterial esquemático: subida logo após B1, incisura perto de B2
function pulso(t, atraso = 0) {
  const u = ((t - atraso) % T + T) % T;
  const up = 0.15, pico = 0.24, b2 = 0.44;
  if (u < up) return 0.12 * (1 - u / up) ** 2;
  if (u < pico) return Math.sin(((u - up) / (pico - up)) * Math.PI / 2);
  if (u < b2) return 1 - 0.32 * ((u - pico) / (b2 - pico));
  if (u < b2 + 0.03) return 0.62 + 0.08 * Math.sin(((u - b2) / 0.03) * Math.PI);
  return 0.62 * (1 - (u - b2 - 0.03) / (T - b2 - 0.03)) + 0.12 * ((u - b2 - 0.03) / (T - b2 - 0.03));
}

export function sincronia(node) {
  node.classList.add('sincronia');
  node.innerHTML = `<svg class="sy-svg" viewBox="0 0 ${W} 210" role="img" aria-label="Pulso carotídeo sincronizado com B1 e B2"></svg><div class="sy-ctrl"></div>`;
  const svg = node.querySelector('svg');
  const path = (atraso) => {
    let d = '';
    for (let i = 0; i <= 320; i++) { const t = (i / 320) * T * CIC; d += `${i ? 'L' : 'M'}${tx(t).toFixed(1)} ${(120 - pulso(t, atraso) * 90).toFixed(1)} `; }
    return d;
  };
  el('line', { x1: X0, x2: X1, y1: 172, y2: 172, class: 'sy-base' }, svg);
  const rad = el('path', { d: path(0.08), class: 'sy-rad' }, svg);
  el('path', { d: path(0), class: 'sy-car' }, svg);
  const lc = el('text', { x: X1, y: 22, class: 'sy-lab car', 'text-anchor': 'end' }, svg); lc.textContent = 'pulso carotídeo';
  const lr = el('text', { x: X1, y: 40, class: 'sy-lab rad', 'text-anchor': 'end' }, svg); lr.textContent = 'pulso radial (atrasado)';
  const ev = [];
  for (let c = 0; c < CIC; c++) {
    for (const [t, k, h] of [[0.15, 'B1', 34], [0.44, 'B2', 26]]) {
      const x = tx(c * T + t);
      el('rect', { x: x - 4, y: 172 - h, width: 8, height: h, rx: 2, class: k.toLowerCase() }, svg);
      const tt = el('text', { x, y: 196, class: `sy-b ${k.toLowerCase()}` }, svg); tt.textContent = k;
      ev.push([c * T + t, k]);
    }
  }
  const cur = el('line', { y1: 10, y2: 180, class: 'sy-cur' }, svg);
  rad.style.display = 'none'; lr.style.display = 'none';

  let t = 0, last = null, raf = 0, playing = false;
  const bPlay = button({ icon: 'play', label: 'Reproduzir com som', text: 'Ouvir e ver', cls: 'primary' });
  const bRad = button({ label: 'Mostrar o pulso radial', text: 'Comparar com o radial', cls: 'chip', pressed: false });
  node.querySelector('.sy-ctrl').append(bPlay, bRad);
  bRad.addEventListener('click', () => {
    const on = rad.style.display === 'none';
    rad.style.display = on ? '' : 'none'; lr.style.display = on ? '' : 'none';
    bRad.setAttribute('aria-pressed', String(on));
  });
  const draw = () => { const x = tx(t); cur.setAttribute('x1', x); cur.setAttribute('x2', x); };
  function frame(now) {
    if (!playing) return;
    const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    const prev = t;
    t = (t + dt * (prefersReducedMotion() ? 0.5 : 1)) % (T * CIC);
    for (const [te, k] of ev) if ((prev < te && t >= te) || (t < prev && te >= prev)) thump(k);
    draw();
    raf = requestAnimationFrame(frame);
  }
  const stop = () => { playing = false; cancelAnimationFrame(raf); setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir e ver'; };
  bPlay.addEventListener('click', () => {
    if (playing) { stop(); return; }
    getContext();
    playing = true; last = null;
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
    raf = requestAnimationFrame(frame);
  });
  draw();
  return { deactivate: stop, pause: stop };
}
