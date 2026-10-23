/**
 * Pressão venosa jugular (PVJ): modelo de vista lateral com cabeceira ajustável.
 *
 * Modelo (esquemático, fora de escala):
 *  - o tronco gira em torno do quadril; o ângulo esternal fica a 42 cm dele;
 *  - o átrio direito fica cerca de 5 cm abaixo do ângulo esternal, na vertical,
 *    em qualquer inclinação (aproximação clássica);
 *  - a coluna de sangue na jugular interna sobe até a altura vertical
 *    "átrio direito + pressão venosa central (cmH2O)": é um nível horizontal;
 *  - a pulsação só é vista se esse nível cair no trecho do pescoço entre a
 *    clavícula e o ângulo da mandíbula.
 *  Por isso a altura h acima do ângulo esternal não muda com a inclinação;
 *  o que muda é onde (e se) o topo aparece no pescoço.
 */
import { button, captureKeys, prefersReducedMotion } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const K = 6.4;            // px por cm
const HIP = [600, 400];   // pivô do quadril (px)
const T = 14.6;           // altura da face anterior do tórax acima do eixo do encosto (cm)
const S_SA = 42, S_CL = 46, S_JAW = 56, S_HEAD = 64;

const PACIENTES = {
  normal: { nome: 'PVC normal', pvc: 7, txt: 'Pressão venosa central de 7 cmH₂O.' },
  alta: { nome: 'PVC elevada', pvc: 14, txt: 'Pressão venosa central de 14 cmH₂O, como na insuficiência cardíaca descompensada.' },
  baixa: { nome: 'PVC baixa', pvc: 2, txt: 'Pressão venosa central de 2 cmH₂O, como na desidratação.' },
};

export function pvj(node) {
  node.classList.add('pvj');
  node.tabIndex = 0;
  node.setAttribute('role', 'application');
  node.setAttribute('aria-label', 'Modelo da pressão venosa jugular. Setas para cima e para baixo mudam a inclinação da cabeceira.');
  node.innerHTML = `
    <div class="pv-fig"></div>
    <aside class="pv-panel">
      <div class="pv-pac" role="group" aria-label="Paciente"></div>
      <label class="pv-angle">Cabeceira <output class="mono">45°</output>
        <input type="range" min="0" max="90" step="1" value="45" aria-label="Inclinação da cabeceira em graus">
      </label>
      <div class="pv-presets"></div>
      <div class="pv-read" aria-live="polite"></div>
      <p class="pv-note">Modelo esquemático, fora de escala. Na prática, o topo da pulsação é procurado com luz tangencial, e h é medida com uma régua vertical e outra horizontal a partir do ângulo esternal.</p>
    </aside>`;

  const svg = el('svg', { viewBox: '0 -90 760 560', class: 'pv-svg', role: 'img', 'aria-label': 'Paciente deitado com a cabeceira elevada; veia jugular, ângulo esternal e altura h' }, node.querySelector('.pv-fig'));
  // cama
  el('rect', { x: 30, y: HIP[1] + 4, width: 720, height: 14, rx: 4, class: 'pv-bed' }, svg);
  el('rect', { x: 40, y: HIP[1] + 18, width: 10, height: 40, class: 'pv-bed' }, svg);
  el('rect', { x: 710, y: HIP[1] + 18, width: 10, height: 40, class: 'pv-bed' }, svg);
  const backrest = el('line', { class: 'pv-backrest' }, svg);
  // pernas (fixas)
  el('path', { d: `M ${HIP[0]} ${HIP[1]} L 748 ${HIP[1]} L 748 ${HIP[1] - 36} C 710 ${HIP[1] - 42} 660 ${HIP[1] - 52} ${HIP[0]} ${HIP[1] - 10 * K} Z`, class: 'pv-body' }, svg);
  const torso = el('g', { class: 'pv-torso' }, svg);
  // tronco desenhado em coordenadas locais (eixo x ao longo do tronco, em cm × K, y para "frente" negativo)
  el('path', { d: `M 0 0 L ${-S_CL * K} 0 L ${-S_CL * K} ${-14 * K} C ${-S_SA * K} ${-15 * K} ${-20 * K} ${-12.5 * K} 0 ${-10 * K} Z`, class: 'pv-body' }, torso);
  el('path', { d: `M ${-S_CL * K} ${-1 * K} L ${-S_JAW * K - 10} ${-1.5 * K} L ${-S_JAW * K - 10} ${-8.5 * K} L ${-S_CL * K} ${-10.5 * K} Z`, class: 'pv-body neck' }, torso);
  el('ellipse', { cx: -(S_HEAD + 1) * K, cy: -6 * K, rx: 9.5 * K, ry: 8.5 * K, class: 'pv-body' }, torso);
  el('path', { d: `M ${-(S_JAW - 0.5) * K} ${-8.6 * K} q ${-1.2 * K} ${-3 * K} ${-4 * K} ${-4 * K}`, class: 'pv-jaw' }, torso);
  // clavícula e ângulo esternal (marcas)
  el('line', { x1: -S_CL * K, x2: -S_CL * K + 18, y1: -T * K - 4, y2: -T * K - 16, class: 'pv-clav' }, torso);
  el('circle', { cx: -S_SA * K, cy: -T * K - 5, r: 6, class: 'pv-sa' }, torso);
  // veia jugular interna ao longo do pescoço (desenhada por cima)
  el('line', { x1: -S_CL * K, x2: -S_JAW * K, y1: -6.5 * K, y2: -7.4 * K, class: 'pv-vein-bg' }, torso);
  const vein = el('line', { x1: -S_CL * K, y1: -6.5 * K, class: 'pv-vein' }, torso);
  const topDot = el('circle', { r: 6, class: 'pv-top' }, torso);
  // átrio direito (ponto de referência)
  const ra = el('circle', { r: 9, class: 'pv-ra' }, svg);
  const raT = el('text', { class: 'pv-t small' }, svg); raT.textContent = 'átrio direito';
  // linhas de medida
  const lvl = el('line', { class: 'pv-level' }, svg);
  const hLine = el('line', { class: 'pv-h' }, svg);
  const hBase = el('line', { class: 'pv-hbase' }, svg);
  const hT = el('text', { class: 'pv-t h' }, svg);
  const saT = el('text', { class: 'pv-t' }, svg); saT.textContent = 'ângulo esternal';
  const fiveL = el('line', { class: 'pv-five' }, svg);
  const fiveT = el('text', { class: 'pv-t small' }, svg); fiveT.textContent = '≈ 5 cm';
  const arc = el('path', { class: 'pv-arc' }, svg);
  const angT = el('text', { class: 'pv-t ang' }, svg);

  let theta = 45, pac = PACIENTES.normal, t0 = 0, raf = 0, active = false;
  const range = node.querySelector('input[type=range]');
  const outp = node.querySelector('output');
  const read = node.querySelector('.pv-read');

  const pacBtns = Object.entries(PACIENTES).map(([k, v]) => {
    const b = button({ label: v.nome, text: v.nome, cls: 'chip', pressed: k === 'normal' });
    b.addEventListener('click', () => { pac = v; pacBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    node.querySelector('.pv-pac').appendChild(b);
    return b;
  });
  [[0, 'Deitado'], [30, '30°'], [45, '45°'], [90, 'Sentado']].forEach(([v, l]) => {
    const b = button({ label: `Cabeceira a ${v} graus`, text: l, cls: 'chip' });
    b.addEventListener('click', () => { theta = v; range.value = v; draw(); });
    node.querySelector('.pv-presets').appendChild(b);
  });
  range.addEventListener('input', () => { theta = Number(range.value); draw(); });
  range.addEventListener('keydown', (e) => e.stopPropagation());

  function draw(pulse = 0) {
    torso.setAttribute('transform', `translate(${HIP[0]} ${HIP[1]}) rotate(${theta})`);
    // (rotate positivo no SVG é horário; com a cabeça à esquerda, horário ergue a cabeça)
    const rot = (sx, sy) => {
      const a = theta * Math.PI / 180;
      return [HIP[0] + sx * Math.cos(a) - sy * Math.sin(a), HIP[1] + sx * Math.sin(a) + sy * Math.cos(a)];
    };
    const sa = rot(-S_SA * K, -T * K - 5);
    const ySA = (HIP[1] - sa[1]) / K;              // altura do ângulo esternal acima do pivô (cm)
    const yRA = ySA - 5;
    const yTop = yRA + pac.pvc + pulse;            // nível da coluna venosa (cm)
    // posição da veia ao longo do pescoço: altura de um ponto s do pescoço
    const veinH = (s) => (HIP[1] - rot(-s * K, -7 * K)[1]) / K;
    const hCl = veinH(S_CL), hJaw = veinH(S_JAW);
    let sTop = null, estado;
    if (yTop <= hCl) estado = 'abaixo';
    else if (yTop >= hJaw) estado = 'acima';
    else {
      // interpolação linear ao longo do pescoço
      sTop = S_CL + (yTop - hCl) / (hJaw - hCl) * (S_JAW - S_CL);
      estado = 'visivel';
    }
    const sEnd = estado === 'abaixo' ? S_CL : estado === 'acima' ? S_JAW : sTop;
    vein.setAttribute('x2', -sEnd * K);
    vein.setAttribute('y2', -(6.5 + (sEnd - S_CL) / (S_JAW - S_CL) * 0.9) * K);
    vein.style.display = estado === 'abaixo' ? 'none' : '';
    topDot.style.display = estado === 'visivel' ? '' : 'none';
    if (sTop) { topDot.setAttribute('cx', -sTop * K); topDot.setAttribute('cy', -(6.5 + (sTop - S_CL) / (S_JAW - S_CL) * 0.9) * K); }
    // átrio direito: 5 cm abaixo do ângulo esternal, na vertical
    const raP = [sa[0], sa[1] + 5 * K];
    ra.setAttribute('cx', raP[0]); ra.setAttribute('cy', raP[1]);
    raT.setAttribute('x', raP[0] + 14); raT.setAttribute('y', raP[1] + 4);
    fiveL.setAttribute('x1', sa[0]); fiveL.setAttribute('x2', sa[0]); fiveL.setAttribute('y1', sa[1]); fiveL.setAttribute('y2', raP[1]);
    fiveT.setAttribute('x', sa[0] - 52); fiveT.setAttribute('y', (sa[1] + raP[1]) / 2 + 4);
    // nível horizontal e medida h
    const yPx = HIP[1] - (yRA + pac.pvc) * K;
    const xRuler = 735; // régua vertical à direita; régua horizontal parte do ângulo esternal
    lvl.setAttribute('x1', 20); lvl.setAttribute('x2', 740); lvl.setAttribute('y1', yPx); lvl.setAttribute('y2', yPx);
    hLine.setAttribute('x1', xRuler); hLine.setAttribute('x2', xRuler); hLine.setAttribute('y1', sa[1]); hLine.setAttribute('y2', yPx);
    const h = pac.pvc - 5;
    hBase.setAttribute('x1', sa[0]); hBase.setAttribute('x2', xRuler + 8); hBase.setAttribute('y1', sa[1]); hBase.setAttribute('y2', sa[1]);
    hT.setAttribute('x', xRuler + 10); hT.setAttribute('y', (sa[1] + yPx) / 2 + 5);
    hT.textContent = `h = ${h > 0 ? '+' : ''}${h} cm`;
    saT.setAttribute('x', sa[0] + 14); saT.setAttribute('y', sa[1] + 18);
    // arco do ângulo
    const r = 70, a = theta * Math.PI / 180;
    arc.setAttribute('d', `M ${HIP[0] - r} ${HIP[1]} A ${r} ${r} 0 0 1 ${HIP[0] - r * Math.cos(a)} ${HIP[1] - r * Math.sin(a)}`);
    angT.setAttribute('x', HIP[0] - r - 40); angT.setAttribute('y', HIP[1] - 12);
    angT.textContent = `${theta}°`;
    const br = rot(-60 * K, 3 * K);
    backrest.setAttribute('x1', HIP[0]); backrest.setAttribute('y1', HIP[1] + 3);
    backrest.setAttribute('x2', br[0]); backrest.setAttribute('y2', br[1]);
    outp.textContent = `${theta}°`;
    node.dataset.estado = estado;
    if (!pulse) {
      const elev = h > 3;
      const onde = {
        visivel: 'O topo da pulsação aparece no pescoço: é ali que se mede.',
        abaixo: 'O topo fica atrás da clavícula: não se vê pulsação. Abaixe a cabeceira.',
        acima: 'A veia fica cheia até a mandíbula: o topo não aparece. Eleve a cabeceira.',
      }[estado];
      read.innerHTML = `<p class="pv-big">h = <b>${h > 0 ? '+' : ''}${h} cm</b> acima do ângulo esternal</p>
        <p>${onde}</p>
        <p>${pac.txt} ${elev ? '<b class="alt">h maior que 3 cm: pressão venosa elevada.</b>' : 'h até 3 cm: dentro do esperado.'}</p>`;
    }
  }

  function loop(now) {
    if (!active) return;
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    // pulsação venosa esquemática (duas ondas por ciclo, ~0,4 cm)
    const ph = (t % 0.85) / 0.85;
    const w = 0.35 * Math.exp(-((ph - 0.08) ** 2) / 0.004) + 0.25 * Math.exp(-((ph - 0.6) ** 2) / 0.008);
    draw(prefersReducedMotion() ? 0 : w);
    raf = requestAnimationFrame(loop);
  }

  captureKeys(node, (e) => {
    if (e.target !== node) return false;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { theta = Math.min(90, theta + 5); range.value = theta; draw(); return true; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { theta = Math.max(0, theta - 5); range.value = theta; draw(); return true; }
    return false;
  });

  draw();
  return {
    activate() { if (!active) { active = true; t0 = 0; raf = requestAnimationFrame(loop); } },
    deactivate() { active = false; cancelAnimationFrame(raf); draw(); },
    pause() { active = false; cancelAnimationFrame(raf); draw(); },
  };
}
