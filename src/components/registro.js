/**
 * Construtor de registro do exame cardiovascular: cada linha do prontuário
 * tem opções; o texto final é montado na ordem do exame, e o que difere do
 * exame normal fica destacado. Atalhos: "Exame normal" e "Sr. Antônio".
 */
import { button } from '../core/ui.js';

const LINHAS = [
  { id: 'pa', rot: 'Pressão arterial', ops: [
    ['PA 118 × 76 mmHg (MSE, sentado, média das duas últimas de três medidas); FC 72 bpm.', 'normal'],
    ['PA 156 × 94 mmHg (MSD, sentado, média das duas últimas de três medidas); FC 78 bpm.', 'elevada'],
  ] },
  { id: 'pulsos', rot: 'Pulsos', ops: [
    ['Pulsos periféricos palpáveis, simétricos, amplitude 2+.', 'normais'],
    ['Pulsos pediosos e tibiais posteriores diminuídos (1+) bilateralmente; demais palpáveis, 2+.', 'diminuídos nos pés'],
  ] },
  { id: 'jug', rot: 'Jugulares', ops: [
    ['Jugulares sem turgência a 45°.', 'sem turgência'],
    ['Turgência jugular a 45°, topo da pulsação 6 cm acima do ângulo esternal.', 'turgência'],
  ] },
  { id: 'prec', rot: 'Precórdio', ops: [
    ['Precórdio sem abaulamentos. Ictus cordis visível e palpável no 5º EIC na LHCE, 2 polpas digitais, não propulsivo. Sem frêmitos.', 'ictus normal'],
    ['Precórdio sem abaulamentos. Ictus cordis não palpável em decúbito dorsal e em decúbito lateral esquerdo. Sem frêmitos.', 'ictus impalpável'],
    ['Precórdio sem abaulamentos. Ictus cordis no 6º EIC, 2 cm lateral à LHCE, 3 polpas digitais, propulsivo. Sem frêmitos.', 'ictus desviado'],
  ] },
  { id: 'acv', rot: 'Ausculta', ops: [
    ['ACV: RCR em 2T, BNF, sem sopros.', 'normal'],
    ['ACV: RCR em 2T, BNF. Sopro sistólico de ejeção em foco aórtico acessório, grau II/VI, sem irradiação, timbre agudo, qualidade suave, sem variação com a respiração.', 'sopro sistólico'],
    ['ACV: RCR em 3T à custa de B3, audível no ápice em decúbito lateral esquerdo. Sem sopros.', 'terceira bulha'],
  ] },
  { id: 'mmii', rot: 'Membros inferiores', ops: [
    ['MMII sem edema.', 'sem edema'],
    ['Edema de MMII 2+, bilateral e simétrico, até o terço médio das pernas.', 'edema 2+'],
  ] },
];
const PRESETS = {
  normal: { pa: 0, pulsos: 0, jug: 0, prec: 0, acv: 0, mmii: 0 },
  antonio: { pa: 1, pulsos: 0, jug: 0, prec: 0, acv: 1, mmii: 0 },
};

export function registro(node) {
  node.classList.add('registro');
  node.innerHTML = `
    <div class="rg-left">
      <div class="rg-presets"></div>
      <div class="rg-rows"></div>
    </div>
    <div class="rg-right">
      <div class="rg-sheet mono" aria-live="polite"></div>
      <details class="rg-siglas">
        <summary>Siglas</summary>
        <dl>
          <div><dt>PA</dt><dd>pressão arterial</dd></div><div><dt>FC</dt><dd>frequência cardíaca</dd></div>
          <div><dt>MSE / MSD</dt><dd>membro superior esquerdo / direito</dd></div><div><dt>EIC</dt><dd>espaço intercostal</dd></div>
          <div><dt>LHCE</dt><dd>linha hemiclavicular esquerda</dd></div><div><dt>ACV</dt><dd>aparelho cardiovascular</dd></div>
          <div><dt>RCR</dt><dd>ritmo cardíaco regular</dd></div><div><dt>2T / 3T</dt><dd>em dois / três tempos</dd></div>
          <div><dt>BNF</dt><dd>bulhas normofonéticas</dd></div><div><dt>MMII</dt><dd>membros inferiores</dd></div>
        </dl>
      </details>
    </div>`;
  const st = { ...PRESETS.normal };
  const rows = node.querySelector('.rg-rows');
  const sheet = node.querySelector('.rg-sheet');
  const btns = {};

  for (const l of LINHAS) {
    const r = document.createElement('div');
    r.className = 'rg-row';
    r.innerHTML = `<p class="rg-l">${l.rot}</p><div class="rg-ops" role="radiogroup" aria-label="${l.rot}"></div>`;
    btns[l.id] = l.ops.map(([, lab], i) => {
      const b = button({ label: `${l.rot}: ${lab}`, text: lab, cls: 'chip' });
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => { st[l.id] = i; render(); });
      r.querySelector('.rg-ops').appendChild(b);
      return b;
    });
    rows.appendChild(r);
  }
  function render() {
    for (const l of LINHAS) btns[l.id].forEach((b, i) => { b.setAttribute('aria-pressed', String(st[l.id] === i)); b.setAttribute('aria-checked', String(st[l.id] === i)); });
    sheet.innerHTML = LINHAS.map((l) => `<p class="${st[l.id] ? 'alt' : ''}">${l.ops[st[l.id]][0]}</p>`).join('');
  }
  const pr = node.querySelector('.rg-presets');
  [['normal', 'Exame normal'], ['antonio', 'Sr. Antônio']].forEach(([k, l]) => {
    const b = button({ label: `Preencher: ${l}`, text: l, cls: 'ghost' });
    b.addEventListener('click', () => { Object.assign(st, PRESETS[k]); render(); });
    pr.appendChild(b);
  });
  render();
  return {};
}
