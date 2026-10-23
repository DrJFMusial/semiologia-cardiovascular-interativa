/**
 * ECG normal em papel milimetrado (25 mm/s, 10 mm/mV): ondas e intervalos
 * destacáveis, régua de frequência (300 ÷ quadrados grandes entre dois R)
 * e marcação das bulhas sob o traçado.
 * Valores: Diretriz SBC de laudos eletrocardiográficos 2022.
 */
import { button, captureKeys } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const PXS = 300;          // px por segundo (12 px por quadradinho de 0,04 s)
const PXMV = 120;         // px por mV (12 px por 0,1 mV)
const W = 1404, H = 312, BASE = 210;
const gauss = (t, m, s) => Math.exp(-((t - m) ** 2) / (2 * s * s));

// um batimento, t em s a partir do início da onda P
const BEAT = { p0: 0, p1: 0.08, q0: 0.16, q1: 0.24, r: 0.2, t0: 0.38, t1: 0.54, b1: 0.24, b2: 0.53 };
function v(t) {
  return 0.15 * gauss(t, 0.04, 0.016)
    - 0.1 * gauss(t, 0.178, 0.006)
    + 1.25 * gauss(t, 0.2, 0.009)
    - 0.3 * gauss(t, 0.222, 0.007)
    + 0.32 * gauss(t, 0.46, 0.038);
}

const INFO = {
  P: { nome: 'Onda P', faixa: [BEAT.p0, BEAT.p1], txt: 'Despolarização dos átrios. No ritmo sinusal é positiva em D1, D2 e aVF, e cada P é seguida de um QRS.' },
  PR: { nome: 'Intervalo PR', faixa: [BEAT.p0, BEAT.q0], txt: 'Do início da P ao início do QRS: tempo de condução do átrio ao ventrículo. Normal de 0,12 a 0,20 s (3 a 5 quadradinhos). Acima de 0,20 s: bloqueio atrioventricular (BAV) de 1º grau.' },
  QRS: { nome: 'Complexo QRS', faixa: [BEAT.q0, BEAT.q1], txt: 'Despolarização dos ventrículos. Duração menor que 0,12 s (menos de 3 quadradinhos); a partir de 0,12 s é alargado. B1 vem logo depois do QRS.' },
  T: { nome: 'Onda T', faixa: [BEAT.t0, BEAT.t1], txt: 'Repolarização dos ventrículos. O fim da onda T coincide com B2: a eletricidade precede o som.' },
  RR: { nome: 'Intervalo RR', faixa: null, txt: 'Distância entre dois R. Com ritmo regular, FC ≈ 300 ÷ número de quadrados grandes entre dois R. Normal em vigília: 50 a 99 bpm.' },
};

export function ecg(node) {
  node.classList.add('ecg');
  node.innerHTML = `
    <div class="eg-paper"></div>
    <div class="eg-bottom">
      <div class="eg-btns" role="group" aria-label="Destacar"></div>
      <div class="eg-card" aria-live="polite"></div>
      <div class="eg-fc">
        <label>Quadrados grandes entre dois R <output class="mono"></output>
          <input type="range" min="2" max="7" step="1" value="4" aria-label="Número de quadrados grandes entre dois R"></label>
        <p class="eg-fcv" aria-live="polite"></p>
      </div>
    </div>`;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'eg-svg', role: 'img', 'aria-label': 'Traçado de eletrocardiograma normal em papel milimetrado' }, node.querySelector('.eg-paper'));
  const grid = el('g', { class: 'eg-grid' }, svg);
  for (let x = 0; x <= W; x += 12) el('line', { x1: x, x2: x, y1: 0, y2: 264, class: x % 60 === 0 ? 'big' : 'small' }, grid);
  for (let y = 0; y <= 264; y += 12) el('line', { x1: 0, x2: W, y1: y, y2: y, class: y % 60 === 0 ? 'big' : 'small' }, grid);
  const hl = el('g', { class: 'eg-hl' }, svg);
  const trace = el('path', { class: 'eg-trace' }, svg);
  const marks = el('g', { class: 'eg-marks' }, svg);
  const sounds = el('g', { class: 'eg-sounds' }, svg);
  // calibração 0,20 s
  el('line', { x1: W - 84, x2: W - 24, y1: 250, y2: 250, class: 'eg-cal' }, svg);
  const tc = el('text', { x: W - 54, y: 244, class: 'eg-calt' }, svg); tc.textContent = '0,20 s';

  let rr = 4, sel = 'PR';
  const out = node.querySelector('output');
  const fcv = node.querySelector('.eg-fcv');
  const card = node.querySelector('.eg-card');
  const range = node.querySelector('input');

  function beats() {
    const per = rr * 0.2;
    const res = [];
    for (let b = 0.12; b < W / PXS; b += per) res.push(b);
    return { res, per };
  }

  function draw() {
    const { res, per } = beats();
    let d = '';
    for (let x = 0; x <= W; x += 2) {
      const t = x / PXS;
      let val = 0;
      for (const b of res) { const tt = t - b; if (tt > -0.1 && tt < 0.7) val += v(tt); }
      d += `${x ? 'L' : 'M'}${x} ${(BASE - val * PXMV).toFixed(1)} `;
    }
    trace.setAttribute('d', d);
    // bulhas
    sounds.innerHTML = '';
    for (const b of res) {
      for (const [k, t, cls] of [['B1', BEAT.b1 + 0.02, 'b1'], ['B2', BEAT.b2, 'b2']]) {
        const x = (b + t) * PXS;
        if (x > W - 10) continue;
        el('rect', { x: x - 3, y: 276, width: 6, height: k === 'B1' ? 22 : 16, rx: 2, class: cls }, sounds);
        const tx = el('text', { x: x + 8, y: 294, class: `eg-st ${cls}` }, sounds); tx.textContent = k;
      }
    }
    highlight(res, per);
    out.textContent = rr;
    const fc = Math.round(300 / rr);
    const cls = fc < 50 ? 'bradicardia (menor que 50 bpm)' : fc >= 100 ? 'taquicardia (100 bpm ou mais)' : 'dentro da faixa normal em vigília (50 a 99 bpm)';
    fcv.innerHTML = `FC ≈ 300 ÷ ${rr} = <b>${fc} bpm</b>: ${cls}.`;
  }

  function highlight(res, per) {
    hl.innerHTML = ''; marks.innerHTML = '';
    const i = INFO[sel];
    const b = res[1] ?? res[0];
    if (sel === 'RR') {
      const x1 = (b + BEAT.r) * PXS, x2 = (b + per + BEAT.r) * PXS;
      el('line', { x1, x2, y1: 26, y2: 26, class: 'eg-dim' }, marks);
      [x1, x2].forEach((x) => el('line', { x1: x, x2: x, y1: 18, y2: 70, class: 'eg-dim' }, marks));
      const t = el('text', { x: (x1 + x2) / 2, y: 18, class: 'eg-dimt' }, marks);
      t.textContent = `RR = ${rr} quadrados grandes = ${(per).toFixed(2).replace('.', ',')} s`;
    } else {
      const [a, z] = i.faixa;
      const x1 = (b + a) * PXS, x2 = (b + z) * PXS;
      el('rect', { x: x1, y: 0, width: x2 - x1, height: 264, class: 'eg-band' }, hl);
      el('line', { x1, x2, y1: 248, y2: 248, class: 'eg-dim' }, marks);
      [x1, x2].forEach((x) => el('line', { x1: x, x2: x, y1: 240, y2: 256, class: 'eg-dim' }, marks));
      const dur = z - a;
      const t = el('text', { x: (x1 + x2) / 2, y: 238, class: 'eg-dimt' }, marks);
      t.textContent = `${dur.toFixed(2).replace('.', ',')} s = ${Math.round(dur / 0.04)} quadradinhos`;
    }
    card.innerHTML = `<h4>${i.nome}</h4><p>${i.txt}</p>`;
  }

  const btns = Object.keys(INFO).map((k) => {
    const b = button({ label: `Destacar: ${INFO[k].nome}`, text: k, cls: 'seg', pressed: k === sel });
    b.addEventListener('click', () => { sel = k; btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    node.querySelector('.eg-btns').appendChild(b);
    return b;
  });
  range.addEventListener('input', () => { rr = Number(range.value); draw(); });
  range.addEventListener('keydown', (e) => e.stopPropagation());
  captureKeys(node, () => false);
  draw();
  return {};
}
