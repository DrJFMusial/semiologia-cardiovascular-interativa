/**
 * Mapa de pulsos arteriais: figura em posição anatômica (palmas para a frente),
 * trajeto arterial esquemático e pontos de palpação clicáveis.
 * Direita e esquerda são as do paciente (a direita dele fica à esquerda da tela).
 */
import { captureKeys } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const PULSOS = {
  carotideo: { nome: 'Carotídeo', pts: [[139, 104], [161, 104]], onde: 'Borda medial do esternocleidomastóideo, abaixo do ângulo da mandíbula.', como: 'Um lado de cada vez, sem massagear. É a referência para sincronizar a ausculta: coincide com B1.' },
  braquial: { nome: 'Braquial', pts: [[78, 252], [222, 252]], onde: 'Face medial do braço, na fossa cubital, medial ao tendão do bíceps.', como: 'É onde se ausculta a pressão arterial.' },
  radial: { nome: 'Radial', pts: [[48, 352], [252, 352]], onde: 'Face anterior do punho, do lado do polegar, sobre o rádio.', como: 'Contar por 1 minuto: frequência, ritmo e amplitude. Serve para estimar a sistólica antes de auscultar.' },
  femoral: { nome: 'Femoral', pts: [[128, 338], [172, 338]], onde: 'Abaixo do ligamento inguinal, a meio caminho entre a espinha ilíaca anterossuperior e a sínfise púbica.', como: 'Palpação firme, com o paciente deitado.' },
  popliteo: { nome: 'Poplíteo', pts: [[124, 470], [176, 470]], onde: 'Fossa poplítea, atrás do joelho.', como: 'Joelho levemente fletido, pontas dos dedos das duas mãos pressionando fundo. Muitas vezes é difícil de sentir.', atras: true },
  tibial: { nome: 'Tibial posterior', pts: [[137, 598], [163, 598]], onde: 'Atrás e abaixo do maléolo medial.', como: 'Pé relaxado; comparar com o outro lado.' },
  pedioso: { nome: 'Pedioso (dorsal do pé)', pts: [[116, 622], [184, 622]], onde: 'Dorso do pé, lateral ao tendão do extensor longo do hálux.', como: 'Pode ser ausente em pessoas saudáveis; o achado vale pela comparação entre os lados.' },
};

export function pulsos(node) {
  node.classList.add('pulsos');
  node.innerHTML = `<div class="pu-fig"></div><div class="pu-card" aria-live="polite"><p class="pu-hint">Toque em um ponto para ver onde e como palpar.</p></div>`;
  const svg = el('svg', { viewBox: '0 0 300 650', class: 'pu-svg', role: 'img', 'aria-label': 'Corpo em posição anatômica com os pontos de palpação dos pulsos' }, node.querySelector('.pu-fig'));
  // silhueta
  const body = el('g', { class: 'pu-body' }, svg);
  el('circle', { cx: 150, cy: 52, r: 34 }, body);
  el('path', { d: 'M136 82 L164 82 L168 118 L132 118 Z' }, body);
  el('path', { d: 'M96 122 Q150 108 204 122 L214 200 L206 330 L94 330 L86 200 Z' }, body);
  // braços (palmas para a frente)
  el('path', { d: 'M98 124 Q78 130 74 160 L62 250 L44 350 L36 384 L56 392 L66 356 L88 258 L100 190 Z' }, body);
  el('path', { d: 'M202 124 Q222 130 226 160 L238 250 L256 350 L264 384 L244 392 L234 356 L212 258 L200 190 Z' }, body);
  // pernas
  el('path', { d: 'M94 326 L148 330 L146 460 L142 590 L148 610 L150 636 L104 636 L118 604 L120 470 Z' }, body);
  el('path', { d: 'M206 326 L152 330 L154 460 L158 590 L152 610 L150 636 L196 636 L182 604 L180 470 Z' }, body);
  // trajeto arterial
  const art = el('g', { class: 'pu-art' }, svg);
  el('path', { d: 'M150 200 L150 120 M150 128 L139 92 M150 128 L161 92' }, art);
  el('path', { d: 'M146 132 Q110 132 92 150 L80 240 L66 300 L50 360' }, art);
  el('path', { d: 'M154 132 Q190 132 208 150 L220 240 L234 300 L250 360' }, art);
  el('path', { d: 'M150 200 L150 300 L130 330 L124 470 L136 596 L118 622 M150 300 L170 330 L176 470 L164 596 L182 622' }, art);
  // pontos
  const marks = {};
  const g = el('g', {}, svg);
  for (const [k, p] of Object.entries(PULSOS)) {
    marks[k] = p.pts.map(([x, y]) => {
      const m = el('g', { class: `pu-pt${p.atras ? ' atras' : ''}`, tabindex: 0, role: 'button', 'aria-label': `Pulso ${p.nome}`, 'data-k': k }, g);
      el('circle', { cx: x, cy: y, r: 13, class: 'halo' }, m);
      el('circle', { cx: x, cy: y, r: 6.5, class: 'dot' }, m);
      return m;
    });
  }
  const lt = el('text', { x: 20, y: 640, class: 'pu-lado' }, svg); lt.textContent = 'direita';
  const rt = el('text', { x: 280, y: 640, class: 'pu-lado', 'text-anchor': 'end' }, svg); rt.textContent = 'esquerda';

  const card = node.querySelector('.pu-card');
  let sel = null;
  function show(k) {
    sel = k;
    Object.entries(marks).forEach(([kk, arr]) => arr.forEach((m) => m.classList.toggle('sel', kk === k)));
    svg.classList.toggle('has-sel', !!k);
    if (!k) { card.innerHTML = '<p class="pu-hint">Toque em um ponto para ver onde e como palpar.</p>'; return; }
    const p = PULSOS[k];
    card.innerHTML = `<h4>${p.nome}</h4><p class="pu-onde">${p.onde}</p><p>${p.como}</p>${p.atras ? '<p class="pu-obs">Ponto na face posterior: marcado em tracejado.</p>' : ''}`;
  }
  Object.values(marks).flat().forEach((m) => {
    m.addEventListener('click', () => show(m.dataset.k === sel ? null : m.dataset.k));
    m.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); show(m.dataset.k); } });
  });
  captureKeys(node, (e) => { if (e.key === 'Escape') { show(null); return true; } return false; });
  return {};
}
