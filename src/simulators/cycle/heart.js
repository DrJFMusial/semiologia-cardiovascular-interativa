/**
 * Coração esquemático em corte frontal (quatro câmaras), desenhado em SVG.
 * Convenção: vista anterior; o lado DIREITO do paciente fica à ESQUERDA da tela.
 * O desenho é didático: proporções aproximadas, sem pretensão de escala.
 *
 * Elementos animados pelo estado do ciclo (stateAt):
 *  - cavidades ventriculares: dimensão ∝ volume (constante nas fases isovolumétricas);
 *  - parede ventricular: tonalidade ∝ pressão (mostra a tensão na contração isovolumétrica);
 *  - cavidades atriais: dimensão ∝ volume atrial relativo;
 *  - folhetos valvares: abertos/fechados conforme a fase;
 *  - partículas de fluxo: só atravessam valvas abertas e com velocidade ∝ dV/dt.
 */
const NS = 'http://www.w3.org/2000/svg';

const GEO = {
  // cavidades (paths) e centros de escala
  rvCav: { d: 'M96 352 C90 440 150 512 268 552 C292 520 304 430 302 376 C300 360 290 352 280 350 C200 344 130 346 96 352 Z', c: [205, 420] },
  lvCav: { d: 'M352 356 C344 440 356 520 380 572 C470 540 532 460 536 360 C536 352 528 348 520 348 C470 344 400 346 368 348 C358 349 353 352 352 356 Z', c: [440, 430] },
  raCav: { d: 'M86 336 C78 266 100 194 160 184 C214 176 248 210 254 262 L256 336 Z', c: [168, 262] },
  laCav: { d: 'M394 336 L396 290 C402 250 440 232 490 236 C542 242 558 284 552 336 Z', c: [474, 290] },
};

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

/** Folheto valvar: linha articulada em (x,y), comprimento L, ângulo em graus. */
function leaflet(parent, x, y, L, cls) {
  const g = el('g', { class: `leaflet ${cls}`, transform: `translate(${x} ${y})` }, parent);
  el('line', { x1: 0, y1: 0, x2: L, y2: 0, class: 'edge' }, g);
  el('line', { x1: 0, y1: 0, x2: L, y2: 0 }, g);
  return g;
}

let heartCount = 0;
export function createHeart(container, { labels = true } = {}) {
  // ids únicos por instância: gradientes de um slide oculto (display:none) não pintam em outro
  const P = `h${++heartCount}`;
  const svg = el('svg', {
    viewBox: '0 0 620 640', class: 'heart-svg', role: 'img',
    'aria-label': 'Corte frontal esquemático do coração com quatro câmaras, valvas e grandes vasos',
  });
  container.appendChild(svg);
  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <linearGradient id="${P}-myo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E9B9A9"/><stop offset="1" stop-color="#D99A88"/>
    </linearGradient>
    <linearGradient id="${P}-art" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E05A5F"/><stop offset="1" stop-color="#B92F3A"/>
    </linearGradient>
    <linearGradient id="${P}-ven" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5D82C4"/><stop offset="1" stop-color="#2F5197"/>
    </linearGradient>
    <filter id="${P}-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6"/><feOffset dy="5"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // sem filtro SVG no grupo animado: o desfoque recalculado a cada quadro custava ~50 % do tempo de quadro
  const root = el('g', {}, svg);
  svg.style.setProperty('--g-myo', `url(#${P}-myo)`);
  svg.style.setProperty('--g-art', `url(#${P}-art)`);
  svg.style.setProperty('--g-ven', `url(#${P}-ven)`);

  // Vasos como tubos: contorno escuro largo + preenchimento colorido.
  const parts = {};
  const tube = (d, w, side, cls = '', part) => {
    el('path', { d, class: `tube-edge ${cls}`, 'stroke-width': w + 3 }, root);
    const t = el('path', { d, class: `tube ${side} ${cls}`, 'stroke-width': w, 'data-part': part || cls }, root);
    if (part) parts[part] = t;
    return t;
  };
  const C = {
    svc: 'M136 20 L136 205',
    ivc: 'M64 640 L64 330 C64 300 84 290 112 292',
    pv1: 'M640 246 C600 246 575 252 550 264',
    pv2: 'M640 300 C600 300 575 296 552 292',
    aorta: 'M303 336 L303 160 C303 90 340 52 395 52 C455 52 485 92 485 140',
    rpa: 'M372 204 C340 198 300 196 236 200',
    pulm: 'M282 372 C300 340 332 322 352 300 C366 284 372 270 372 252 L372 212 C372 190 392 178 420 178 L566 178',
  };
  tube(C.svc, 46, 'ven', '', 'vcs');
  tube(C.ivc, 42, 'ven', '', 'vci');
  tube(C.pv1, 26, 'art', '', 'vp');
  tube(C.pv2, 26, 'art', '', 'vp2');
  tube(C.rpa, 26, 'ven', 'rpa', 'ap2');
  tube(C.aorta, 42, 'art', 'aorta', 'aorta');

  // ---- câmaras ----------------------------------------------------------
  const myoV = el('path', {
    class: 'myo myo-v',
    d: 'M74 338 C66 452 160 566 372 612 C506 570 566 470 560 338 C470 330 170 330 74 338 Z',
  }, root);
  const myoRA = el('path', { class: 'myo myo-a', d: 'M68 340 C54 262 84 176 160 164 C228 154 270 196 272 258 L274 340 Z' }, root);
  const myoLA = el('path', { class: 'myo myo-a', d: 'M376 340 L378 286 C382 236 428 210 490 214 C556 220 578 274 570 340 Z' }, root);

  const raCav = el('path', { class: 'cav ven', d: GEO.raCav.d, 'data-part': 'ad' }, root);
  const laCav = el('path', { class: 'cav art', d: GEO.laCav.d, 'data-part': 'ae' }, root);
  const rvCav = el('path', { class: 'cav ven', d: GEO.rvCav.d, 'data-part': 'vd' }, root);
  const lvCav = el('path', { class: 'cav art', d: GEO.lvCav.d, 'data-part': 've' }, root);
  Object.assign(parts, { ad: raCav, ae: laCav, vd: rvCav, ve: lvCav, myoV });
  // via de saída do VE (posterior), unindo a cavidade à raiz da aorta
  el('path', { class: 'cav art', d: 'M282 336 C284 352 318 362 350 366 L366 352 C346 346 330 340 324 330 L324 320 L282 320 Z' }, root);
  // tronco pulmonar (anterior), saindo do infundíbulo do VD
  tube(C.pulm, 40, 'ven', 'pulm', 'tp');

  el('path', { class: 'annulus', d: 'M70 340 L274 340 M376 340 L572 340' }, root);

  // ---- valvas ------------------------------------------------------------
  const valves = el('g', { class: 'valves' }, root);
  const tri = [leaflet(valves, 102, 340, 70, 'av tri'), leaflet(valves, 248, 340, 70, 'av tri mirror')];
  const mit = [leaflet(valves, 404, 340, 72, 'av mit'), leaflet(valves, 548, 340, 72, 'av mit mirror')];
  const ao = [leaflet(valves, 283, 306, 20, 'semi ao'), leaflet(valves, 323, 306, 20, 'semi ao mirror')];
  const pu = [leaflet(valves, 353, 266, 19, 'semi pu'), leaflet(valves, 391, 266, 19, 'semi pu mirror')];

  // ---- partículas de fluxo (seguem as linhas centrais dos vasos) -----------
  const flowG = el('g', { class: 'flow' }, root);
  const guide = (d) => el('path', { d, fill: 'none', stroke: 'none' }, flowG);
  const paths = {
    svc: { p: guide('M136 30 L136 190 C140 220 150 240 165 262'), side: 'ven', always: true, n: 5 },
    ivc: { p: guide('M64 630 L64 330 C64 300 84 292 112 292 C130 292 150 286 165 275'), side: 'ven', always: true, n: 6 },
    pv: { p: guide('M636 300 C600 300 575 296 552 292 C520 286 500 284 478 284'), side: 'art', always: true, n: 4 },
    tri: { p: guide('M172 262 C174 300 176 330 178 350 C182 400 196 440 212 478'), side: 'ven', gate: 'av', n: 9 },
    mit: { p: guide('M476 286 C476 310 476 330 474 350 C468 410 450 450 432 486'), side: 'art', gate: 'av', n: 9 },
    pulm: { p: guide('M236 480 C250 430 266 400 282 372 C300 340 332 322 352 300 C366 284 372 270 372 252 L372 212 C372 190 392 178 420 178 L560 178'), side: 'ven', gate: 'semi', n: 11 },
    aor: { p: guide('M420 470 C400 420 372 380 340 360 C318 348 303 344 303 320 L303 160 C303 90 340 52 395 52 C455 52 485 92 485 138'), side: 'art', gate: 'semi', n: 14 },
  };
  const particles = [];
  for (const [key, p] of Object.entries(paths)) {
    p.len = p.p.getTotalLength();
    for (let i = 0; i < p.n; i++) {
      particles.push({ key, s: i / p.n, node: el('circle', { r: 4.2, class: `particle ${p.side}` }, flowG) });
    }
  }
  const along = (p, s) => { const q = p.p.getPointAtLength(s * p.len); return [q.x, q.y]; };

  // ---- rótulos -------------------------------------------------------------
  const lab = el('g', { class: 'heart-labels' }, svg);
  const L = (x, y, t, anchor = 'middle', cls = '') => {
    const tx = el('text', { x, y, 'text-anchor': anchor, class: `hl ${cls}` }, lab);
    tx.textContent = t;
    return tx;
  };
  L(168, 268, 'AD'); L(474, 300, 'AE'); L(196, 452, 'VD'); L(440, 452, 'VE');
  L(166, 14, 'v. cava superior', 'start', 'small');
  L(395, 22, 'aorta', 'middle', 'small');
  L(566, 154, 'artéria pulmonar', 'end', 'small');
  L(608, 334, 'veias', 'middle', 'small'); L(608, 349, 'pulmonares', 'middle', 'small');
  L(22, 480, 'v. cava inferior', 'middle', 'small vertical');
  const vLabels = {
    tri: L(175, 362, 'tricúspide', 'middle', 'valve-l'),
    mit: L(476, 362, 'mitral', 'middle', 'valve-l'),
    ao: L(303, 288, 'aórtica', 'middle', 'valve-l halo'),
    pu: L(372, 236, 'pulmonar', 'middle', 'valve-l halo'),
  };
  lab.querySelector('.vertical')?.setAttribute('transform', 'rotate(-90 22 480)');
  lab.style.display = labels ? '' : 'none';

  // ---- atualização -----------------------------------------------------------
  const scaleCav = (node, geo, kx, ky) => {
    const [cx, cy] = geo.c;
    node.setAttribute('transform', `translate(${cx} ${cy}) scale(${kx} ${ky}) translate(${-cx} ${-cy})`);
  };
  const setLeaflet = (g, deg, mirror) => {
    const x = g.transform.baseVal[0].matrix.e, y = g.transform.baseVal[0].matrix.f;
    g.setAttribute('transform', `translate(${x} ${y}) rotate(${mirror ? 180 - deg : deg})`);
  };
  let avAngle = 70, semiAngle = 0; // ângulos animados (suavizados)
  let last = null;

  function update(st, dtReal = 0.016) {
    // ventrículos: escala ∝ raiz do volume (VDF = 120 mL)
    const k = Math.sqrt(st.vol / 120);
    const kx = 0.55 + 0.45 * k, ky = 0.8 + 0.2 * k;
    scaleCav(lvCav, GEO.lvCav, kx, ky);
    scaleCav(rvCav, GEO.rvCav, kx, ky);
    // tensão da parede: tonalidade conforme pressão do VE (0-120 mmHg)
    const p = Math.min(1, st.pve / 120);
    myoV.style.setProperty('--tension', p.toFixed(3));
    // átrios
    const ka = 0.72 + 0.28 * st.vat;
    scaleCav(laCav, GEO.laCav, ka, 0.85 + 0.15 * st.vat);
    scaleCav(raCav, GEO.raCav, ka, 0.85 + 0.15 * st.vat);
    myoRA.classList.toggle('contracting', st.atrialContracting);
    myoLA.classList.toggle('contracting', st.atrialContracting);
    // valvas: ângulo alvo; fechamento rápido (~25 ms), abertura um pouco mais lenta
    const avTarget = st.avOpen ? 72 : 0;
    const semiTarget = st.semiOpen ? 80 : 0;
    const rate = (cur, tgt) => cur + (tgt - cur) * Math.min(1, dtReal * (tgt < cur ? 40 : 18));
    avAngle = last ? rate(avAngle, avTarget) : avTarget;
    semiAngle = last ? rate(semiAngle, semiTarget) : semiTarget;
    // AV abrem para dentro do ventrículo (para baixo); semilunares para cima
    setLeaflet(tri[0], avAngle, false); setLeaflet(tri[1], avAngle, true);
    setLeaflet(mit[0], avAngle, false); setLeaflet(mit[1], avAngle, true);
    setLeaflet(ao[0], -semiAngle, false); setLeaflet(ao[1], -semiAngle, true);
    setLeaflet(pu[0], -semiAngle, false); setLeaflet(pu[1], -semiAngle, true);
    svg.classList.toggle('av-open', st.avOpen);
    svg.classList.toggle('semi-open', st.semiOpen);
    for (const [k2, t] of Object.entries(vLabels)) {
      const open = (k2 === 'tri' || k2 === 'mit') ? st.avOpen : st.semiOpen;
      t.classList.toggle('open', open);
    }
    // partículas
    const fill = Math.max(0, st.dv) / 600; // mL/s normalizado
    const eject = Math.max(0, -st.dv) / 600;
    for (const q of particles) {
      const pth = paths[q.key];
      let v = 0;
      if (pth.always) v = 0.25;
      else if (pth.gate === 'av') v = st.avOpen ? fill * 1.6 : 0;
      else if (pth.gate === 'semi') v = st.semiOpen ? eject * 1.2 : 0;
      q.s = (q.s + v * dtReal) % 1;
      const vis = pth.always || v > 0.02;
      const [x, y] = along(pth, q.s);
      q.node.setAttribute('cx', x.toFixed(1));
      q.node.setAttribute('cy', y.toFixed(1));
      q.node.style.opacity = vis ? (Math.sin(Math.PI * q.s) * 0.95).toFixed(2) : '0';
    }
    last = st;
  }

  return {
    svg, update, parts, root,
    setLabels(on) { lab.style.display = on ? '' : 'none'; },
    setFlow(on) { flowG.style.display = on ? '' : 'none'; },
    reset() { last = null; },
  };
}
