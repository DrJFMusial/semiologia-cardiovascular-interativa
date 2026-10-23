/**
 * Tórax interativo para os focos de ausculta (Porto & Porto, cap. 47):
 *  - modo "explorar": clicar em um foco mostra localização e finalidade;
 *  - modo "exercício": o estudante clica onde colocaria o estetoscópio e
 *    recebe feedback explicando ONDE clicou (lado, espaço intercostal,
 *    relação com esterno e linha hemiclavicular) e onde fica o foco pedido.
 *
 * Geometria (cm; origem na fúrcula; y para cima; x>0 = lado ESQUERDO do paciente):
 *  costela k insere-se no esterno em y = -0,45 - 0,55(k-1) e desce
 *  lateralmente: y = y_k - 0,10(|x| - 0,45)^2. Ângulo esternal na 2ª costela.
 *  Linha hemiclavicular em |x| = 1,65. Esquema didático, fora de escala real.
 */
import { button, captureKeys } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const S = 100; // px por cm
const X = (x) => x * S;
const Y = (y) => -y * S;
const yCost = (k, x) => -0.45 - 0.55 * (k - 1) - 0.1 * (Math.abs(x) - 0.45) ** 2;
const yEic = (k, x) => -0.45 - 0.55 * (k - 0.5) - 0.1 * (Math.abs(x) - 0.45) ** 2;
const LHC = 1.65;

export const FOCOS = [
  {
    id: 'A', nome: 'Foco aórtico', x: -0.66, y: yEic(2, 0.66), cor: 'var(--art)',
    local: '2º espaço intercostal direito, junto ao esterno.',
    para: 'Fenômenos da valva aórtica, como o sopro de ejeção que se irradia para o pescoço. B2 é mais intensa na base.',
  },
  {
    id: 'P', nome: 'Foco pulmonar', x: 0.66, y: yEic(2, 0.66), cor: 'var(--ven)',
    local: '2º espaço intercostal esquerdo, junto ao esterno.',
    para: 'Melhor local para analisar a segunda bulha e o seu desdobramento fisiológico na inspiração.',
  },
  {
    id: 'Aa', nome: 'Foco aórtico acessório', x: 0.66, y: yEic(3, 0.66), cor: 'var(--petrol)',
    local: '3º espaço intercostal esquerdo, junto ao esterno.',
    para: 'Frequentemente o melhor ponto para sopros de origem aórtica, sobretudo os diastólicos, com o paciente sentado e inclinado para a frente.',
  },
  {
    id: 'T', nome: 'Foco tricúspide', x: 0.18, y: -3.98, cor: 'var(--slate)',
    local: 'Base do apêndice xifoide, ligeiramente à esquerda.',
    para: 'Fenômenos da valva tricúspide. Sons do lado direito aumentam na inspiração profunda.',
  },
  {
    id: 'M', nome: 'Foco mitral', x: LHC, y: yEic(5, LHC), cor: 'var(--sound)',
    local: '5º espaço intercostal esquerdo, na linha hemiclavicular; corresponde ao ictus cordis.',
    para: 'B1 é mais intensa aqui. Localize o ictus antes de auscultar: em corações aumentados, o foco se desloca para fora.',
  },
];

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
const pathFn = (fn, x0, x1, n = 30) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    d += `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(fn(x)).toFixed(1)} `;
  }
  return d;
};

/** Descreve em palavras um ponto clicado (cm). */
export function descrever(x, y) {
  const lado = x < 0 ? 'direito' : 'esquerdo';
  const ax = Math.abs(x);
  if (y > 0.05) return { texto: 'acima da fúrcula, no pescoço', eic: null, lado };
  if (ax < 0.47 && y > -3.85) {
    const k = (-0.45 - y) / 0.55 + 1;
    return { texto: `sobre o esterno, na altura do ${Math.max(1, Math.floor(k))}º espaço intercostal`, eic: null, lado, esterno: true };
  }
  if (ax < 0.47 && y <= -3.85) return { texto: 'sobre o apêndice xifoide', eic: null, lado, xifoide: true };
  const k = (-0.45 - (y + 0.1 * (ax - 0.45) ** 2)) / 0.55 + 1; // índice de costela contínuo
  const frac = k - Math.floor(k);
  const eic = Math.floor(k);
  const fem = lado === 'direito' ? 'direita' : 'esquerda';
  let vert;
  if (k < 1) vert = `acima da 1ª costela ${fem}`;
  else if (frac < 0.18) vert = `sobre a ${Math.floor(k)}ª costela ${fem}`;
  else if (frac > 0.82) vert = `sobre a ${Math.ceil(k)}ª costela ${fem}`;
  else vert = `no ${eic}º espaço intercostal ${lado}`;
  let horiz;
  if (ax < 1.05) horiz = 'junto ao esterno';
  else if (Math.abs(ax - LHC) < 0.4) horiz = 'na linha hemiclavicular';
  else if (ax < LHC) horiz = 'entre o esterno e a linha hemiclavicular';
  else horiz = 'lateral à linha hemiclavicular';
  return { texto: `${vert}, ${horiz}`, eic: frac >= 0.18 && frac <= 0.82 ? eic : null, lado, horiz };
}

export function focos(node) {
  node.classList.add('focos');
  node.innerHTML = `
    <div class="fo-figure"></div>
    <aside class="fo-panel">
      <div class="fo-modes" role="group" aria-label="Modo"></div>
      <div class="fo-body" aria-live="polite"></div>
      <div class="fo-toggles"></div>
    </aside>`;
  const fig = node.querySelector('.fo-figure');
  const svg = el('svg', {
    viewBox: '-400 -150 800 690', class: 'thorax-svg', role: 'img',
    'aria-label': 'Tórax anterior esquemático com costelas, esterno e focos de ausculta',
  }, fig);

  // silhueta do tronco
  el('path', {
    class: 'skin',
    d: 'M-105 -55 C-160 -55 -290 -75 -355 -35 C-385 -10 -375 160 -345 260 C-330 360 -325 460 -315 530 L315 530 C325 460 330 360 345 260 C375 160 385 -10 355 -35 C290 -75 160 -55 105 -55 C75 -90 55 -120 50 -140 L-50 -140 C-55 -120 -75 -90 -105 -55 Z',
  }, svg);
  // linhas de referência (atrás dos ossos)
  const lines = el('g', { class: 'ref-lines' }, svg);
  el('line', { x1: 0, y1: -120, x2: 0, y2: 520, class: 'rl mid' }, lines);
  for (const s of [-1, 1]) el('line', { x1: X(s * LHC), y1: -30, x2: X(s * LHC), y2: 520, class: 'rl lhc' }, lines);
  const tLHC = el('text', { x: X(LHC) + 6, y: 515, class: 'rl-t' }, lines); tLHC.textContent = 'linha hemiclavicular';
  const tMid = el('text', { x: 6, y: -110, class: 'rl-t' }, lines); tMid.textContent = 'medioesternal';

  // costelas 1-7, margem costal
  const ribs = el('g', { class: 'ribs' }, svg);
  for (let k = 1; k <= 7; k++) {
    for (const s of [-1, 1]) {
      el('path', { d: pathFn((x) => yCost(k, x), s * 0.47, s * 3.05), class: 'rib' }, ribs);
    }
  }
  for (const s of [-1, 1]) el('path', { d: `M${s * 22} 425 C${s * 120} 455 ${s * 230} 475 ${s * 305} 490`, class: 'rib margin' }, ribs);
  // esterno: manúbrio, corpo, xifoide; clavículas
  el('path', { class: 'bone', d: `M-50 -5 L50 -5 L42 100 L-42 100 Z` }, svg);
  el('path', { class: 'bone', d: `M-42 100 L42 100 L46 385 L-46 385 Z` }, svg);
  el('path', { class: 'bone', d: `M-22 385 L22 385 L0 445 Z` }, svg);
  for (const s of [-1, 1]) el('path', { class: 'clav', d: `M${s * 52} -8 C${s * 130} 0 ${s * 200} -45 ${s * 300} -30` }, svg);
  // ângulo esternal
  el('line', { x1: -60, x2: 60, y1: 100, y2: 100, class: 'angle' }, svg);
  // números dos espaços intercostais junto à borda esternal direita, onde a contagem começa (ângulo esternal)
  const nums = el('g', { class: 'eic-nums' }, svg);
  for (let k = 1; k <= 6; k++) {
    const t = el('text', { x: X(-1.22), y: Y(yEic(k, 1.22)) + 5, class: 'eic-n', 'text-anchor': 'middle' }, nums);
    t.textContent = `${k}º`;
  }
  const lado = el('g', { class: 'side-tags' }, svg);
  const ld = el('text', { x: -390, y: -120, class: 'side-t' }, lado); ld.textContent = 'direita do paciente';
  const le = el('text', { x: 390, y: -120, class: 'side-t', 'text-anchor': 'end' }, lado); le.textContent = 'esquerda do paciente';
  // mamilos (referência de superfície, ~4º EIC na LHC no homem)
  for (const s of [-1, 1]) el('circle', { cx: X(s * 1.68), cy: Y(yEic(4, 1.68)) + 6, r: 7, class: 'nipple' }, svg);

  // focos
  const focG = el('g', { class: 'foci' }, svg);
  const marks = {};
  for (const f of FOCOS) {
    const g = el('g', { class: 'focus', tabindex: 0, role: 'button', 'aria-label': f.nome, 'data-id': f.id }, focG);
    el('circle', { cx: X(f.x), cy: Y(f.y), r: 25, class: 'focus-halo' }, g);
    el('circle', { cx: X(f.x), cy: Y(f.y), r: 16, class: 'focus-dot', style: `fill:${f.cor}` }, g);
    const t = el('text', { x: X(f.x), y: Y(f.y) + 5, class: 'focus-t' }, g); t.textContent = f.id;
    marks[f.id] = g;
  }
  // marcador de clique (exercício)
  const pin = el('g', { class: 'pin', style: 'display:none' }, svg);
  el('circle', { r: 11, class: 'pin-dot' }, pin);
  el('circle', { r: 20, class: 'pin-ring' }, pin);

  // ---- painel -------------------------------------------------------------
  const body = node.querySelector('.fo-body');
  let mode = 'explorar';
  let alvo = null;
  let ordem = [];
  let acertos = 0;

  function showFocus(id) {
    const f = FOCOS.find((q) => q.id === id);
    Object.entries(marks).forEach(([k, g]) => g.classList.toggle('sel', k === id));
    body.innerHTML = `
      <div class="fo-badge" style="background:${f.cor}">${f.id}</div>
      <h4>${f.nome}</h4>
      <p class="fo-local">${f.local}</p>
      <p>${f.para}</p>
      <p class="fo-note estudo-only">Os focos são pontos de referência e não a projeção das valvas: ausculte todo o precórdio, a axila, o pescoço e o dorso.</p>`;
  }
  function explorar() {
    mode = 'explorar';
    svg.classList.remove('exercise'); pin.style.display = 'none';
    Object.values(marks).forEach((g) => { g.classList.remove('sel', 'hidden'); g.setAttribute('tabindex', '0'); });
    body.innerHTML = '<p class="fo-hint">Clique em um foco para ver localização e finalidade.</p><ol class="fo-list">' +
      FOCOS.map((f) => `<li><button type="button" class="link" data-f="${f.id}"><b style="color:${f.cor}">${f.id}</b> ${f.nome}</button></li>`).join('') + '</ol>';
    body.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => showFocus(b.dataset.f)));
  }
  function novaRodada() {
    if (!ordem.length) ordem = [...FOCOS].sort(() => Math.random() - 0.5);
    alvo = ordem.pop();
    pin.style.display = 'none';
    body.innerHTML = `
      <p class="fo-kicker">Exercício · ${5 - ordem.length}/5</p>
      <h4>Onde você colocaria o estetoscópio para o <span style="color:${alvo.cor}">${alvo.nome.toLowerCase()}</span>?</h4>
      <p class="fo-hint">Clique no tórax ou escolha uma localização abaixo com o teclado. Qual lado, espaço intercostal e linha?</p>
      <div class="fo-locations" role="group" aria-label="Responder pela localização">${FOCOS.map(f => `<button type="button" class="link" data-location="${f.id}">${f.local}</button>`).join('')}</div>`;
    body.querySelectorAll('[data-location]').forEach(b => b.addEventListener('click', () => {
      const f = FOCOS.find(f => f.id === b.dataset.location);
      answerPoint({ x: f.x, y: f.y, px: X(f.x), py: Y(f.y) });
      body.querySelector('.fo-next')?.focus({ preventScroll: true });
    }));
  }
  function exercicio() {
    mode = 'exercicio'; acertos = 0; ordem = [];
    svg.classList.add('exercise');
    Object.values(marks).forEach((g) => { g.classList.add('hidden'); g.setAttribute('tabindex', '-1'); });
    novaRodada();
  }

  const toCm = (ev) => {
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x / S, y: -p.y / S, px: p.x, py: p.y };
  };
  svg.addEventListener('click', (ev) => {
    if (mode === 'explorar') {
      const g = ev.target.closest('.focus');
      if (g) showFocus(g.dataset.id);
      return;
    }
    answerPoint(toCm(ev));
  });
  function answerPoint(p) {
    if (!alvo || body.querySelector('.fo-next')) return;
    pin.setAttribute('transform', `translate(${p.px} ${p.py})`);
    pin.style.display = '';
    const d = Math.hypot(p.x - alvo.x, p.y - alvo.y);
    const tol = alvo.id === 'M' ? 0.42 : 0.33;
    const desc = descrever(p.x, p.y);
    const ok = d <= tol;
    if (ok) acertos++;
    // qual foco o estudante realmente marcou?
    const perto = FOCOS.map((f) => [f, Math.hypot(p.x - f.x, p.y - f.y)]).sort((a, b) => a[1] - b[1])[0];
    let explic = '';
    if (!ok && perto[1] <= 0.36) explic = `Esse ponto corresponde ao <b>${perto[0].nome.toLowerCase()}</b>. `;
    marks[alvo.id].classList.remove('hidden');
    marks[alvo.id].classList.add('sel', 'reveal');
    body.innerHTML = `
      <p class="fo-kicker">${ok ? 'Correto' : 'Ainda não'}</p>
      <div class="fb ${ok ? 'ok' : 'no'}">
        <p>Você marcou um ponto <b>${desc.texto}</b>.</p>
        <p>${ok ? '' : explic}O ${alvo.nome.toLowerCase()} fica no <b>${alvo.local.replace(/\.$/, '').toLowerCase()}</b>.</p>
      </div>
      <button type="button" class="btn primary fo-next">${ordem.length ? 'Próximo foco' : `Ver resultado (${acertos}/5)`}</button>`;
    body.querySelector('.fo-next').addEventListener('click', () => {
      marks[alvo.id].classList.add('hidden');
      marks[alvo.id].classList.remove('sel', 'reveal');
      if (ordem.length) novaRodada();
      else {
        alvo = null;
        body.innerHTML = `<p class="fo-kicker">Resultado</p><h4>${acertos} de 5 focos</h4>
          <p>Revise os que errou no modo Explorar. Lembre a sequência: base do coração no 2º espaço, dos dois lados do esterno; aórtico acessório um espaço abaixo à esquerda; tricúspide junto ao xifoide; mitral no ictus.</p>`;
        Object.values(marks).forEach((g) => g.classList.remove('hidden'));
      }
    });
  }
  svg.querySelectorAll('.focus').forEach((g) => g.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && mode === 'explorar') { showFocus(g.dataset.id); e.preventDefault(); e.stopPropagation(); }
  }));

  const mb = node.querySelector('.fo-modes');
  const bE = button({ label: 'Explorar os focos', text: 'Explorar', cls: 'seg', pressed: true });
  const bX = button({ label: 'Exercício de localização', text: 'Exercício', cls: 'seg', pressed: false });
  bE.addEventListener('click', () => { bE.setAttribute('aria-pressed', 'true'); bX.setAttribute('aria-pressed', 'false'); explorar(); });
  bX.addEventListener('click', () => { bX.setAttribute('aria-pressed', 'true'); bE.setAttribute('aria-pressed', 'false'); exercicio(); });
  mb.append(bE, bX);

  const tg = node.querySelector('.fo-toggles');
  const bL = button({ label: 'Mostrar linhas de referência', text: 'Linhas', cls: 'chip', pressed: true });
  bL.addEventListener('click', () => {
    const on = bL.getAttribute('aria-pressed') !== 'true';
    bL.setAttribute('aria-pressed', String(on)); lines.style.display = on ? '' : 'none';
  });
  const bN = button({ label: 'Mostrar números dos espaços intercostais', text: 'Nº EIC', cls: 'chip', pressed: true });
  bN.addEventListener('click', () => {
    const on = bN.getAttribute('aria-pressed') !== 'true';
    bN.setAttribute('aria-pressed', String(on)); nums.style.display = on ? '' : 'none';
  });
  tg.append(bL, bN);

  captureKeys(node, (e) => e.key === 'Enter' && e.target.closest?.('.focus'));
  explorar();
  return {};
}
