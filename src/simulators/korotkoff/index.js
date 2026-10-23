/**
 * Simulador de medida auscultatória da pressão arterial.
 * Manômetro aneroide, pera (inflar), válvula (desinsuflar a 2 ou 5 mmHg/s),
 * pulso radial para a estimativa palpatória e sons de Korotkoff esquemáticos
 * nas fases I a V. Modo Explorar (casos nomeados, fases visíveis) e modo
 * Exercício (caso sorteado, leitura pelo ponteiro, feedback explicativo).
 * Valores e técnica: Diretrizes Brasileiras de Medidas da PA 2023 e
 * Diretriz Brasileira de Hipertensão Arterial 2025.
 */
import { korotkoff, getContext } from '../../core/audio.js';
import { button, captureKeys } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const FC = 72;
const RR = 60 / FC;

const CASOS = {
  normal: { nome: 'Adulto, PA normal', pas: 118, pad: 76 },
  antonio: { nome: 'Sr. Antônio', pas: 156, pad: 94 },
  zero: { nome: 'Sons até zero', pas: 150, pad: 0, f4: 70, ateZero: true },
  hiato: { nome: 'Hiato auscultatório', pas: 168, pad: 98, hiato: [156, 132] },
};
const EXERCICIOS = [[118, 76], [126, 84], [136, 88], [144, 92], [156, 94], [108, 70], [132, 78], [148, 96]];

function faseDe(c, p) {
  if (p > c.pas) return 0;
  if (c.hiato && p < c.hiato[0] && p > c.hiato[1]) return 0;
  const f4 = c.f4 ?? c.pad + 6;
  if (p >= c.pas - 10) return 1;
  if (p >= c.pas - 26 && p > f4 + 6) return 2;
  if (p > f4) return 3;
  if (c.ateZero ? p > 0 : p > c.pad) return 4;
  return 0;
}

function classifica(pas, pad) {
  if (pas >= 140 || pad >= 90) return 'na faixa de hipertensão (≥ 140 e/ou ≥ 90 mmHg)';
  if (pas >= 120 || pad >= 80) return 'na faixa de pré-hipertensão (120 a 139 e/ou 80 a 89 mmHg)';
  return 'normal (< 120 e < 80 mmHg)';
}

export function korotkoffSim(node) {
  node.classList.add('korotkoff');
  node.tabIndex = 0;
  node.setAttribute('role', 'application');
  node.setAttribute('aria-label', 'Simulador de pressão arterial. Seta para cima: inflar. Espaço: abrir ou fechar a válvula. E: esvaziar.');
  node.innerHTML = `
    <div class="ko-gauge"></div>
    <div class="ko-strip"></div>
    <aside class="ko-panel">
      <div class="ko-modes" role="group" aria-label="Modo"></div>
      <div class="ko-casos" role="group" aria-label="Caso"></div>
      <div class="ko-ctrl"></div>
      <div class="ko-rate" role="group" aria-label="Velocidade de desinsuflação"></div>
      <div class="ko-state" aria-live="polite"></div>
      <div class="ko-ex"></div>
    </aside>`;

  // ---- manômetro --------------------------------------------------------------
  const g = el('svg', { viewBox: '-170 -170 340 340', class: 'ko-svg', role: 'img', 'aria-label': 'Manômetro aneroide de 0 a 300 mmHg' }, node.querySelector('.ko-gauge'));
  el('circle', { r: 162, class: 'ko-rim' }, g);
  el('circle', { r: 150, class: 'ko-face' }, g);
  const A0 = -225, SPAN = 270; // 0 mmHg em 225° (canto inferior esquerdo), sentido horário
  const ang = (p) => (A0 + (p / 300) * SPAN) * Math.PI / 180;
  for (let p = 0; p <= 300; p += 2) {
    const a = ang(p), big = p % 10 === 0, lab = p % 20 === 0;
    const r1 = 140, r0 = lab ? 118 : big ? 126 : 132;
    el('line', { x1: r0 * Math.cos(a), y1: r0 * Math.sin(a), x2: r1 * Math.cos(a), y2: r1 * Math.sin(a), class: lab ? 'tk l' : big ? 'tk m' : 'tk' }, g);
    if (lab) {
      const t = el('text', { x: 101 * Math.cos(a), y: 101 * Math.sin(a) + 5, class: 'ko-num' }, g);
      t.textContent = p;
    }
  }
  const unit = el('text', { x: 0, y: 58, class: 'ko-unit' }, g); unit.textContent = 'mmHg';
  const digital = el('text', { x: 0, y: 92, class: 'ko-digital' }, g);
  const needle = el('g', { class: 'ko-needle' }, g);
  el('path', { d: 'M -14 0 L 0 -4 L 132 0 L 0 4 Z' }, needle);
  el('circle', { r: 9, class: 'ko-hub' }, g);

  // ---- fita das fases --------------------------------------------------------
  const S = el('svg', { viewBox: '0 0 230 520', class: 'ko-strip-svg', role: 'img', 'aria-label': 'Fases de Korotkoff e batimentos ouvidos' }, node.querySelector('.ko-strip'));
  const sy = (p) => 500 - (p / 200) * 480;
  el('line', { x1: 60, x2: 60, y1: sy(0), y2: sy(200), class: 'ks-axis' }, S);
  for (let p = 0; p <= 200; p += 20) {
    el('line', { x1: 54, x2: 60, y1: sy(p), y2: sy(p), class: 'ks-tick' }, S);
    const t = el('text', { x: 50, y: sy(p) + 4, class: 'ks-num' }, S); t.textContent = p;
  }
  const bands = el('g', { class: 'ks-bands' }, S);
  const beats = el('g', { class: 'ks-beats' }, S);
  const marker = el('g', { class: 'ks-marker' }, S);
  el('path', { d: 'M 56 0 L 44 -7 L 44 7 Z' }, marker);
  const ttl = el('text', { x: 64, y: 14, class: 'ks-title' }, S); ttl.textContent = 'o que se ouve';

  function drawBands(c) {
    bands.innerHTML = '';
    let prev = null, start = null;
    const seg = [];
    for (let p = 200; p >= 0; p -= 1) {
      const f = faseDe(c, p);
      if (f !== prev) { if (prev !== null) seg.push([prev, start, p + 1]); prev = f; start = p; }
    }
    seg.push([prev, start, 0]);
    for (const [f, hi, lo] of seg) {
      if (!f && hi > c.pas) continue;
      el('rect', { x: 66, y: sy(hi), width: 34, height: Math.max(1, sy(lo) - sy(hi)), class: `ks-band f${f}` }, bands);
      if (sy(lo) - sy(hi) > 14) {
        const t = el('text', { x: 108, y: (sy(hi) + sy(lo)) / 2 + 4, class: `ks-lab f${f}` }, bands);
        t.textContent = f ? `fase ${['', 'I', 'II', 'III', 'IV'][f]}` : (c.hiato && hi < c.hiato[0] && lo > c.hiato[1] - 1 ? 'hiato' : 'fase V: silêncio');
      }
    }
  }

  // ---- estado ----------------------------------------------------------------------
  let modo = 'explorar';
  let caso = CASOS.normal;
  let p = 0, valve = false, rate = 2, maxP = 0;
  let tBeat = 0, last = null, raf = 0, active = false;
  let ouvidos = [];
  let showVal = true;
  let respondido = false;

  const panel = node.querySelector('.ko-panel');
  const state = node.querySelector('.ko-state');
  const ex = node.querySelector('.ko-ex');

  const bPump = button({ label: 'Inflar: apertar a pera (seta para cima)', text: 'Inflar', cls: 'primary' });
  const bValve = button({ label: 'Abrir ou fechar a válvula (espaço)', text: 'Abrir válvula' });
  const bEmpty = button({ label: 'Esvaziar o manguito (E)', text: 'Esvaziar', cls: 'ghost' });
  node.querySelector('.ko-ctrl').append(bPump, bValve, bEmpty);

  const rates = [[2, '2 mmHg/s'], [5, '5 mmHg/s']].map(([v, l]) => {
    const b = button({ label: `Desinsuflar a ${l}`, text: l, cls: 'seg', pressed: v === rate });
    b.addEventListener('click', () => { rate = v; rates.forEach((x, i) => x.setAttribute('aria-pressed', String([2, 5][i] === rate))); });
    node.querySelector('.ko-rate').appendChild(b);
    return b;
  });

  const casoBtns = Object.entries(CASOS).map(([k, c]) => {
    const b = button({ label: `Caso: ${c.nome}`, text: c.nome, cls: 'chip', pressed: k === 'normal' });
    b.addEventListener('click', () => { setCaso(c); casoBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
    node.querySelector('.ko-casos').appendChild(b);
    return b;
  });
  const bShow = button({ label: 'Mostrar o valor numérico', text: 'Valor', cls: 'chip', pressed: true });
  bShow.addEventListener('click', () => { showVal = !showVal; bShow.setAttribute('aria-pressed', String(showVal)); render(); });
  node.querySelector('.ko-casos').appendChild(bShow);

  const modos = [['explorar', 'Explorar'], ['exercicio', 'Exercício']].map(([k, l]) => {
    const b = button({ label: `Modo ${l}`, text: l, cls: 'seg', pressed: k === modo });
    b.addEventListener('click', () => setModo(k));
    node.querySelector('.ko-modes').appendChild(b);
    return b;
  });

  // pulso radial (estimativa palpatória)
  const radial = document.createElement('div');
  radial.className = 'ko-radial';
  radial.innerHTML = '<span class="dot"></span><span class="lbl">pulso radial</span>';
  node.querySelector('.ko-gauge').appendChild(radial);

  function setCaso(c) {
    caso = c;
    reset();
    drawBands(c);
  }
  function reset() {
    p = 0; valve = false; maxP = 0; ouvidos = []; beats.innerHTML = ''; respondido = false;
    bValve.querySelector('span').textContent = 'Abrir válvula';
    render();
  }
  function setModo(k) {
    modo = k;
    modos.forEach((b, i) => b.setAttribute('aria-pressed', String(['explorar', 'exercicio'][i] === k)));
    node.classList.toggle('exercicio', k === 'exercicio');
    if (k === 'exercicio') {
      const [pas, pad] = EXERCICIOS[Math.floor(Math.random() * EXERCICIOS.length)];
      showVal = false;
      setCaso({ nome: 'Exercício', pas, pad });
      montaExercicio();
    } else {
      showVal = true;
      setCaso(CASOS.normal);
      casoBtns.forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0)));
      ex.innerHTML = '';
    }
    bShow.setAttribute('aria-pressed', String(showVal));
  }
  function montaExercicio() {
    ex.innerHTML = `
      <p class="ko-q">Meça a pressão: estime pelo pulso radial, infle 20 a 30 mmHg acima, desinsufle a 2 mmHg/s e leia o ponteiro.</p>
      <div class="ko-form">
        <label>Sistólica <input type="number" inputmode="numeric" min="0" max="300" step="1" class="ko-in pas"></label>
        <label>Diastólica <input type="number" inputmode="numeric" min="0" max="300" step="1" class="ko-in pad"></label>
      </div>
      <div class="ko-fbw" aria-live="polite"></div>`;
    const bOk = button({ label: 'Conferir a leitura', text: 'Conferir', cls: 'primary' });
    const bNovo = button({ label: 'Novo paciente', text: 'Novo paciente', cls: 'ghost' });
    ex.querySelector('.ko-form').append(bOk, bNovo);
    ex.querySelectorAll('input').forEach((i) => i.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') conferir(); }));
    bOk.addEventListener('click', conferir);
    bNovo.addEventListener('click', () => setModo('exercicio'));
  }
  function conferir() {
    const vs = Number(ex.querySelector('.pas').value), vd = Number(ex.querySelector('.pad').value);
    const fb = ex.querySelector('.ko-fbw');
    if (!vs || !vd) { fb.innerHTML = '<div class="fb no"><p>Preencha as duas leituras.</p></div>'; return; }
    const sons = ouvidos.map((o) => o.p);
    const primeiro = sons.length ? Math.max(...sons) : null;
    const ultimo = sons.length ? Math.min(...sons) : null;
    const okS = Math.abs(vs - caso.pas) <= 4, okD = Math.abs(vd - caso.pad) <= 4;
    const notas = [];
    if (!sons.length) notas.push('Nenhum som foi ouvido: infle acima da sistólica e abra a válvula para desinsuflar.');
    if (maxP && maxP < caso.pas + 20) notas.push(`O manguito foi inflado só até ${Math.round(maxP)} mmHg. Infle 20 a 30 mmHg acima do ponto em que o pulso radial desaparece.`);
    if (rate > 2 && sons.length) notas.push('A desinsuflação a 5 mmHg/s é rápida demais: entre dois batimentos o ponteiro cai cerca de 4 mmHg e a leitura perde precisão.');
    if ((vs % 5 === 0 || vd % 5 === 0) && (vs !== caso.pas || vd !== caso.pad)) notas.push('Anote o valor lido, sem arredondar para 0 ou 5.');
    if (primeiro) notas.push(`Primeiro som com o ponteiro em ${Math.round(primeiro)} mmHg; último som em ${Math.round(ultimo)} mmHg.`);
    const ok = okS && okD;
    fb.innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}">
      <p><b>${ok ? 'Leitura correta' : 'Confira a leitura'}: ${caso.pas} × ${caso.pad} mmHg.</b>
      Sistólica = primeiro som (fase I); diastólica = desaparecimento dos sons (fase V).</p>
      ${notas.map((n) => `<p>${n}</p>`).join('')}
      <p>Valor ${classifica(caso.pas, caso.pad)}. Uma medida isolada não faz diagnóstico: a confirmação exige medidas em duas ou mais consultas.</p></div>`;
    respondido = true;
    node.classList.add('revelado');
  }

  function render() {
    const a = (A0 + (p / 300) * SPAN);
    needle.setAttribute('transform', `rotate(${a})`);
    digital.textContent = showVal ? `${Math.round(p)}` : '';
    marker.setAttribute('transform', `translate(0 ${sy(Math.min(200, p))})`);
    const f = valve && p > 0 ? faseDe(caso, p) : 0;
    let msg;
    if (p <= 0.5) msg = 'Manguito vazio.';
    else if (!valve) msg = `Válvula fechada: ${showVal ? Math.round(p) + ' mmHg' : 'pressão mantida'}. ${p > caso.pas ? 'Pulso radial ausente.' : 'Pulso radial presente.'}`;
    else msg = `Desinsuflando a ${rate} mmHg/s.`;
    state.textContent = msg;
    node.dataset.fase = f;
  }

  function batimento() {
    const palp = p < caso.pas;
    if (palp) { radial.classList.remove('beat'); void radial.offsetWidth; radial.classList.add('beat'); }
    if (valve && p > 0) {
      const f = faseDe(caso, p);
      if (f) {
        korotkoff(f);
        ouvidos.push({ p, f });
        el('circle', { cx: 83, cy: sy(Math.min(200, p)), r: 3.2, class: `ks-hit f${f}` }, beats);
      }
    }
  }

  function frame(now) {
    if (!active) return;
    const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000);
    last = now;
    if (valve && p > 0) p = Math.max(0, p - rate * dt);
    if (p === 0 && valve) { valve = false; bValve.querySelector('span').textContent = 'Abrir válvula'; }
    tBeat += dt;
    if (tBeat >= RR) { tBeat -= RR; batimento(); }
    render();
    raf = requestAnimationFrame(frame);
  }

  function pump() {
    getContext();
    if (valve) { valve = false; bValve.querySelector('span').textContent = 'Abrir válvula'; }
    p = Math.min(300, p + 15); maxP = Math.max(maxP, p);
    if (p > 0 && ouvidos.length && !respondido) { ouvidos = []; beats.innerHTML = ''; }
    render();
  }
  function toggleValve() {
    getContext();
    if (p <= 0) return;
    valve = !valve;
    bValve.querySelector('span').textContent = valve ? 'Fechar válvula' : 'Abrir válvula';
    render();
  }
  function empty() { p = 0; valve = false; bValve.querySelector('span').textContent = 'Abrir válvula'; render(); }

  bPump.addEventListener('click', pump);
  bValve.addEventListener('click', toggleValve);
  bEmpty.addEventListener('click', empty);
  captureKeys(node, (e) => {
    if (e.target.matches('input')) return false;
    if (e.key === 'ArrowUp') { pump(); return true; }
    if (e.key === ' ' && (e.target === node)) { toggleValve(); return true; }
    if (e.key === 'e' || e.key === 'E') { empty(); return true; }
    return ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key) && e.target === node;
  });

  setCaso(CASOS.normal);
  return {
    activate() { if (!active) { active = true; last = null; raf = requestAnimationFrame(frame); } },
    deactivate() { active = false; cancelAnimationFrame(raf); if (valve) { valve = false; bValve.querySelector('span').textContent = 'Abrir válvula'; render(); } },
    pause() { if (valve) toggleValve(); },
  };
}
