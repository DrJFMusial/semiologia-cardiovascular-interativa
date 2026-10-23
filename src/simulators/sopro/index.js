/**
 * Descritor de sopro: o estudante escolhe as sete características e o
 * componente monta a frase de registro e o desenho do sopro no ciclo.
 * Escala de intensidade: Levine (I a VI); grau IV ou mais implica frêmito.
 */
import { button } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const MOMENTO = {
  sistolico: [
    ['ejecao', 'de ejeção (mesossistólico)', 'sistólico de ejeção'],
    ['holo', 'holossistólico', 'holossistólico'],
    ['proto-s', 'protossistólico', 'protossistólico'],
    ['tele-s', 'telessistólico', 'telessistólico'],
  ],
  diastolico: [
    ['proto-d', 'protodiastólico', 'protodiastólico'],
    ['meso-d', 'mesodiastólico', 'mesodiastólico'],
    ['tele-d', 'telediastólico (pré-sistólico)', 'telediastólico'],
  ],
};
const LEVINE = ['', 'muito baixa, só com atenção', 'baixa, logo percebida', 'moderada, sem frêmito', 'alta, com frêmito', 'audível com a borda do estetoscópio', 'audível com o estetoscópio afastado'];
const CAMPOS = {
  foco: ['aórtico', 'pulmonar', 'aórtico acessório', 'tricúspide', 'mitral'],
  irradiacao: ['sem irradiação', 'irradiado para o pescoço', 'irradiado para a axila', 'irradiado para o dorso'],
  timbre: ['agudo', 'grave'],
  qualidade: ['suave', 'rude', 'aspirativo', 'em ruflar'],
  variacao: ['sem variação com a respiração', 'aumenta na inspiração', 'aumenta em decúbito lateral esquerdo', 'aumenta sentado e inclinado para a frente'],
};
const PRESETS = {
  exemplo: { fase: 'sistolico', momento: 'ejecao', foco: 'aórtico', irradiacao: 'sem irradiação', grau: 2, timbre: 'agudo', qualidade: 'rude', variacao: 'sem variação com a respiração' },
  antonio: { fase: 'sistolico', momento: 'ejecao', foco: 'aórtico acessório', irradiacao: 'sem irradiação', grau: 2, timbre: 'agudo', qualidade: 'suave', variacao: 'sem variação com a respiração' },
};

export function sopro(node) {
  node.classList.add('sopro');
  node.innerHTML = `
    <div class="so-form"></div>
    <div class="so-out">
      <svg class="so-svg" viewBox="0 0 560 150" role="img" aria-label="Desenho do sopro no ciclo cardíaco"></svg>
      <p class="so-k">Registro</p>
      <p class="so-txt mono" aria-live="polite"></p>
      <div class="so-presets"></div>
    </div>`;
  const st = { ...PRESETS.exemplo };
  const form = node.querySelector('.so-form');
  const svg = node.querySelector('.so-svg');
  const txt = node.querySelector('.so-txt');

  function grupo(rotulo, chave, opcoes, n) {
    const g = document.createElement('div');
    g.className = 'so-g';
    g.innerHTML = `<p class="so-l"><span>${n}</span>${rotulo}</p><div class="so-ops" role="radiogroup" aria-label="${rotulo}"></div>`;
    const box = g.querySelector('.so-ops');
    opcoes.forEach(([val, lab]) => {
      const b = button({ label: `${rotulo}: ${lab}`, text: lab, cls: 'chip' });
      b.setAttribute('role', 'radio');
      b.dataset.v = val;
      b.addEventListener('click', () => { st[chave] = chave === 'grau' ? Number(val) : val; if (chave === 'fase') st.momento = MOMENTO[val][0][0]; montar(); });
      box.appendChild(b);
    });
    return g;
  }

  function montar() {
    form.innerHTML = '';
    form.append(
      grupo('Fase', 'fase', [['sistolico', 'sistólico'], ['diastolico', 'diastólico']], 1),
      grupo('Momento', 'momento', MOMENTO[st.fase].map(([v, l]) => [v, l]), '1b'),
      grupo('Foco de maior intensidade', 'foco', CAMPOS.foco.map((x) => [x, x]), 2),
      grupo('Irradiação', 'irradiacao', CAMPOS.irradiacao.map((x) => [x, x]), 3),
      grupo('Intensidade (Levine)', 'grau', [1, 2, 3, 4, 5, 6].map((g) => [String(g), ['I', 'II', 'III', 'IV', 'V', 'VI'][g - 1]]), 4),
      grupo('Timbre', 'timbre', CAMPOS.timbre.map((x) => [x, x]), 5),
      grupo('Qualidade', 'qualidade', CAMPOS.qualidade.map((x) => [x, x]), 6),
      grupo('Variação', 'variacao', CAMPOS.variacao.map((x) => [x, x]), 7),
    );
    form.querySelectorAll('.so-g').forEach((g) => {
      const chave = { Fase: 'fase', Momento: 'momento', 'Foco de maior intensidade': 'foco', 'Irradiação': 'irradiacao', 'Intensidade (Levine)': 'grau', Timbre: 'timbre', Qualidade: 'qualidade', 'Variação': 'variacao' }[g.querySelector('.so-ops').getAttribute('aria-label')];
      g.querySelectorAll('button').forEach((b) => {
        const on = String(st[chave]) === b.dataset.v;
        b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-checked', String(on));
      });
    });
    const lev = document.createElement('p');
    lev.className = 'so-lev';
    lev.textContent = `Grau ${['I', 'II', 'III', 'IV', 'V', 'VI'][st.grau - 1]}: ${LEVINE[st.grau]}.`;
    form.querySelectorAll('.so-g')[4].appendChild(lev);
    desenho();
    const m = MOMENTO[st.fase].find((x) => x[0] === st.momento);
    const grau = ['I', 'II', 'III', 'IV', 'V', 'VI'][st.grau - 1];
    const fremito = st.grau >= 4 ? ', com frêmito' : '';
    txt.textContent = `Sopro ${m[2]} em foco ${st.foco}, grau ${grau}/VI${fremito}, ${st.irradiacao}, timbre ${st.timbre}, qualidade ${st.qualidade}, ${st.variacao}.`;
  }

  function desenho() {
    svg.innerHTML = '';
    const X0 = 20, X1 = 540, y = 108, T0 = 0.07, T1 = 0.97;
    const tx = (t) => X0 + ((t - T0) / (T1 - T0)) * (X1 - X0);
    el('line', { x1: X0, x2: X1, y1: y, y2: y, class: 'so-base' }, svg);
    const B1 = 0.12, B2 = 0.42, B1b = 0.92;
    for (const [t, l, c, hh] of [[B1, 'B1', 'b1', 54], [B2, 'B2', 'b2', 42], [B1b, 'B1', 'b1', 54]]) {
      el('rect', { x: tx(t) - 4, y: y - hh, width: 8, height: hh, rx: 2, class: c }, svg);
      const t2 = el('text', { x: tx(t), y: y + 24, class: `so-bl ${c}` }, svg); t2.textContent = l;
    }
    const h = 18 + st.grau * 8;
    const shapes = {
      ejecao: [B1 + 0.04, B2 - 0.04, 'diamante'], holo: [B1 + 0.012, B2 - 0.008, 'plato'],
      'proto-s': [B1 + 0.02, B1 + 0.14, 'decresc'], 'tele-s': [B2 - 0.14, B2 - 0.012, 'cresc'],
      'proto-d': [B2 + 0.012, B2 + 0.22, 'decresc'], 'meso-d': [0.56, 0.72, 'diamante'], 'tele-d': [0.74, B1b - 0.012, 'cresc'],
    };
    const [a, b, f] = shapes[st.momento];
    const xa = tx(a), xb = tx(b), xm = (xa + xb) / 2;
    const d = {
      diamante: `M${xa} ${y} L${xm} ${y - h} L${xb} ${y} Z`,
      plato: `M${xa} ${y} L${xa + 6} ${y - h * 0.8} L${xb - 6} ${y - h * 0.8} L${xb} ${y} Z`,
      decresc: `M${xa} ${y} L${xa + 4} ${y - h} L${xb} ${y} Z`,
      cresc: `M${xa} ${y} L${xb - 4} ${y - h} L${xb} ${y} Z`,
    }[f];
    el('path', { d, class: 'so-shape' }, svg);
    const ls = el('text', { x: tx((B1 + B2) / 2), y: 18, class: 'so-ph' }, svg); ls.textContent = 'sístole';
    const ld = el('text', { x: tx((B2 + B1b) / 2), y: 18, class: 'so-ph' }, svg); ld.textContent = 'diástole';
  }

  const pr = node.querySelector('.so-presets');
  [['exemplo', 'Exemplo de registro'], ['antonio', 'Sopro do Sr. Antônio']].forEach(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'ghost' });
    b.addEventListener('click', () => { Object.assign(st, PRESETS[k]); montar(); });
    pr.appendChild(b);
  });
  montar();
  return {};
}
