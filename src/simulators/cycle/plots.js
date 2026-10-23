/**
 * Traçados sincronizados do ciclo cardíaco em SVG, com eixo de tempo comum:
 * fases, ECG, pressões (aorta, VE, AE), volume do VE e fonocardiograma
 * esquemático. Um cursor vertical percorre todos os traçados ao mesmo tempo.
 */
import { T, PHASES, EVENTS, series, phono } from './model.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 900;
const X0 = 92, X1 = 880; // área útil horizontal
const tx = (t) => X0 + (t / T) * (X1 - X0);

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
function text(parent, x, y, s, cls = '', anchor = 'start') {
  const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, parent);
  t.textContent = s;
  return t;
}
function polyline(fn, y0, y1, vmin, vmax, n = 400) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * T;
    const v = fn(t);
    const y = y1 - ((v - vmin) / (vmax - vmin)) * (y1 - y0);
    pts.push(`${tx(t).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

const STRIPS = [
  { id: 'fases', h: 44 },
  { id: 'ecg', h: 92, titulo: 'ECG', unidade: 'esquemático' },
  { id: 'pressao', h: 210, titulo: 'Pressão', unidade: 'mmHg' },
  { id: 'volume', h: 110, titulo: 'Volume', unidade: 'VE, mL' },
  { id: 'sons', h: 84, titulo: 'Sons', unidade: 'esquemático' },
];

export function createPlots(container, { onSeek, onPhase } = {}) {
  const svg = el('svg', {
    class: 'plots-svg', role: 'img',
    'aria-label': 'Traçados sincronizados: fases, eletrocardiograma, pressões, volume ventricular e sons cardíacos',
  });
  container.appendChild(svg);

  const layout = {};
  let y = 22;
  const gAll = el('g', {}, svg);
  // eixo de tempo (topo)
  const axis = el('g', { class: 'axis' }, gAll);
  for (let i = 0; i <= 8; i++) {
    const t = i / 10;
    text(axis, tx(t), 14, t.toFixed(1).replace('.', ','), 'tick', 'middle');
  }
  text(axis, 12, 14, 'tempo (s)', 'tick unit', 'start');

  const strips = {};
  for (const s of STRIPS) {
    const g = el('g', { class: `strip strip-${s.id}`, 'data-strip': s.id }, gAll);
    strips[s.id] = { g, y0: y, y1: y + s.h, def: s };
    layout[s.id] = [y, y + s.h];
    if (s.id !== 'fases') {
      el('rect', { x: X0, y, width: X1 - X0, height: s.h, class: 'strip-bg' }, g);
      text(g, 12, y + 18, s.titulo, 'strip-title');
      text(g, 12, y + 34, s.unidade, 'strip-unit');
    }
    y += s.h + 10;
  }
  const H = y + 4;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // ---- faixa de fases (clicável) -----------------------------------------
  const F = strips.fases;
  const phaseRects = {};
  for (const p of PHASES) {
    const r = el('rect', {
      x: tx(p.t0), y: F.y0, width: tx(p.t1) - tx(p.t0), height: F.y1 - F.y0,
      class: `phase-band ph-${p.id}`, tabindex: -1, 'data-phase': p.id,
    }, F.g);
    r.addEventListener('click', (e) => { e.stopPropagation(); onPhase?.(p.id); });
    const cx = (tx(p.t0) + tx(p.t1)) / 2;
    const lbl = text(F.g, cx, F.y0 + 18, String(p.n), 'phase-n', 'middle');
    const lbl2 = text(F.g, cx, F.y0 + 34, p.curto, 'phase-name', 'middle');
    if (tx(p.t1) - tx(p.t0) < 70) lbl2.classList.add('tight');
    phaseRects[p.id] = { r, lbl, lbl2 };
  }
  text(F.g, 12, F.y0 + 18, 'Fases', 'strip-title');
  // sístole / diástole (chaves sob a faixa)
  const bracket = (t0, t1, label, cls) => {
    const yb = F.y1 + 3;
    el('path', { d: `M${tx(t0) + 2} ${yb} L${tx(t0) + 2} ${yb + 4} L${tx(t1) - 2} ${yb + 4} L${tx(t1) - 2} ${yb}`, class: `bracket ${cls}` }, F.g);
  };
  bracket(EVENTS.B1, EVENTS.B2, 'sístole', 'sis');
  bracket(EVENTS.B2, T, 'diástole', 'dia');
  bracket(0, EVENTS.B1, 'diástole', 'dia');

  // ---- ECG ---------------------------------------------------------------
  const E = strips.ecg;
  el('polyline', { points: polyline(series.ecg, E.y0 + 10, E.y1 - 18, -0.35, 1.3, 600), class: 'trace ecg' }, E.g);
  const ecgLab = [['P', 0.765, 0.2], ['QRS', 0.088, 1.33], ['T', 0.37, 0.37]];
  for (const [l, t, v] of ecgLab) {
    const yy = E.y1 - 18 - ((v + 0.35) / 1.65) * (E.y1 - E.y0 - 28);
    text(E.g, tx(t), yy - 4, l, 'trace-label', 'middle');
  }

  // ---- pressões --------------------------------------------------------------
  const P = strips.pressao;
  const pmin = 0, pmax = 130;
  const py = (v) => P.y1 - 6 - ((v - pmin) / (pmax - pmin)) * (P.y1 - P.y0 - 12);
  for (const v of [0, 40, 80, 120]) {
    el('line', { x1: X0, x2: X1, y1: py(v), y2: py(v), class: 'grid' }, P.g);
    text(P.g, X0 - 6, py(v) + 4, String(v), 'tick', 'end');
  }
  el('polyline', { points: polyline(series.pao, P.y0 + 6, P.y1 - 6, pmin, pmax), class: 'trace pao' }, P.g);
  el('polyline', { points: polyline(series.pve, P.y0 + 6, P.y1 - 6, pmin, pmax), class: 'trace pve' }, P.g);
  el('polyline', { points: polyline(series.pae, P.y0 + 6, P.y1 - 6, pmin, pmax), class: 'trace pae' }, P.g);
  const leg = el('g', { class: 'legend' }, P.g);
  [['pao', 'aorta'], ['pve', 'ventrículo esquerdo'], ['pae', 'átrio esquerdo']].forEach(([c, l], i) => {
    const lx = X1 - 200, ly = P.y0 + 18 + i * 16;
    el('line', { x1: lx, x2: lx + 20, y1: ly - 4, y2: ly - 4, class: `trace ${c}` }, leg);
    text(leg, lx + 26, ly, l, 'legend-t');
  });
  text(P.g, tx(0.455), py(97) - 8, 'incisura', 'trace-label small', 'start');

  // ---- volume ---------------------------------------------------------------
  const V = strips.volume;
  const vmin = 40, vmax = 130;
  const vy = (v) => V.y1 - 6 - ((v - vmin) / (vmax - vmin)) * (V.y1 - V.y0 - 12);
  for (const v of [50, 120]) {
    el('line', { x1: X0, x2: X1, y1: vy(v), y2: vy(v), class: 'grid' }, V.g);
    text(V.g, X0 - 6, vy(v) + 4, String(v), 'tick', 'end');
  }
  el('polyline', { points: polyline(series.vol, V.y0 + 6, V.y1 - 6, vmin, vmax), class: 'trace vol' }, V.g);
  text(V.g, tx(0.15), vy(120) - 6, 'volume diastólico final', 'trace-label small', 'middle');
  text(V.g, tx(0.46), vy(50) + 14, 'volume sistólico final', 'trace-label small', 'middle');

  // ---- sons --------------------------------------------------------------------
  const S = strips.sons;
  const sMid = (S.y0 + S.y1) / 2 + 6;
  const soundLine = el('polyline', { class: 'trace phono' }, S.g);
  const extraTxt = {};
  const drawPhono = (opts) => {
    const pts = [];
    for (let i = 0; i <= 1600; i++) {
      const t = (i / 1600) * T;
      pts.push(`${tx(t).toFixed(1)},${(sMid - phono(t, opts) * 26).toFixed(1)}`);
    }
    soundLine.setAttribute('points', pts.join(' '));
    for (const k of ['B3', 'B4']) extraTxt[k].style.display = opts[k.toLowerCase()] ? '' : 'none';
  };
  text(S.g, tx(EVENTS.B1 + 0.035), S.y0 + 16, 'B1', 'sound-label', 'middle');
  text(S.g, tx(EVENTS.B2 + 0.025), S.y0 + 16, 'B2', 'sound-label', 'middle');
  extraTxt.B3 = text(S.g, tx(EVENTS.B3 + 0.022), S.y0 + 16, 'B3', 'sound-label extra', 'middle');
  extraTxt.B4 = text(S.g, tx(EVENTS.B4 + 0.022), S.y0 + 16, 'B4', 'sound-label extra', 'middle');
  drawPhono({});

  // ---- marcos valvares (linhas verticais em todos os traçados) -------------
  const marks = el('g', { class: 'valve-marks' }, gAll);
  const top = strips.ecg.y0, bot = strips.sons.y1;
  [[EVENTS.B1, 'AV fecham', 'av'], [EVENTS.aoOpen, 'semilunares abrem', 'semi'],
    [EVENTS.B2, 'semilunares fecham', 'semi'], [EVENTS.avOpen, 'AV abrem', 'av']].forEach(([t, l, c], i) => {
    el('line', { x1: tx(t), x2: tx(t), y1: top, y2: bot, class: `vmark ${c}` }, marks);
    // posições escolhidas para não cruzar as curvas de pressão
    const yy = strips.pressao.y0 + 14 + (i % 2) * 14;
    const right = i === 3;
    const lab = text(marks, tx(t) + (right ? 4 : -4), yy, l, `vmark-label ${c}`, right ? 'start' : 'end');
    lab.dataset.mark = String(i);
  });

  // ---- cursor ------------------------------------------------------------------------
  const cursor = el('g', { class: 'cursor' }, gAll);
  const cLine = el('line', { y1: strips.fases.y0, y2: bot, class: 'cursor-line' }, cursor);
  const dots = {
    pao: el('circle', { r: 5, class: 'dot pao' }, cursor),
    pve: el('circle', { r: 5, class: 'dot pve' }, cursor),
    pae: el('circle', { r: 4.5, class: 'dot pae' }, cursor),
    vol: el('circle', { r: 5, class: 'dot vol' }, cursor),
  };

  // ---- interação: arrastar para examinar --------------------------------------------
  const toTime = (ev) => {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return Math.min(T - 1e-4, Math.max(0, ((p.x - X0) / (X1 - X0)) * T));
  };
  let dragging = false;
  svg.addEventListener('pointerdown', (ev) => {
    if (ev.target.classList?.contains('phase-band')) return;
    dragging = true; svg.setPointerCapture(ev.pointerId); onSeek?.(toTime(ev), true);
  });
  svg.addEventListener('pointermove', (ev) => { if (dragging) onSeek?.(toTime(ev), true); });
  svg.addEventListener('pointerup', () => { dragging = false; });

  function update(st) {
    const x = tx(st.t);
    cLine.setAttribute('x1', x); cLine.setAttribute('x2', x);
    dots.pao.setAttribute('cx', x); dots.pao.setAttribute('cy', py(st.pao));
    dots.pve.setAttribute('cx', x); dots.pve.setAttribute('cy', py(st.pve));
    dots.pae.setAttribute('cx', x); dots.pae.setAttribute('cy', py(st.pae));
    dots.vol.setAttribute('cx', x); dots.vol.setAttribute('cy', vy(st.vol));
    for (const [id, o] of Object.entries(phaseRects)) o.r.classList.toggle('active', id === st.phase.id);
  }
  function setLayer(id, on) {
    strips[id]?.g.classList.toggle('hidden', !on);
    if (id === 'pressao') { dots.pao.style.display = dots.pve.style.display = dots.pae.style.display = on ? '' : 'none'; }
    if (id === 'volume') dots.vol.style.display = on ? '' : 'none';
  }
  return { svg, update, setLayer, setExtraSounds: drawPhono, layout };
}
