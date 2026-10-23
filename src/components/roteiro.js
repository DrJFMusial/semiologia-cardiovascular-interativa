/**
 * Roteiro semiológico do precórdio: quatro técnicas, cada uma com a pergunta
 * que responde e o que o estudante deve registrar. No modo apresentação o
 * professor revela uma técnica por vez; no modo estudo todas ficam abertas.
 */
const ETAPAS = [
  {
    id: 'inspecao', n: 1, nome: 'Inspeção', verbo: 'Olhar',
    pergunta: 'Há abaulamento, ictus visível ou pulsações anormais?',
    como: 'Tangencial, do lado direito do paciente, e frontal, aos pés do leito.',
    peso: 'alto',
  },
  {
    id: 'percussao', n: 2, nome: 'Percussão', verbo: 'Percutir',
    pergunta: 'Onde o som claro pulmonar passa a maciço?',
    como: 'Do 3º ao 5º espaço intercostal, da linha axilar anterior em direção ao esterno.',
    peso: 'baixo', obs: 'Técnica tradicional, de baixo rendimento: estima mal o tamanho do coração.',
  },
  {
    id: 'palpacao', n: 3, nome: 'Palpação', verbo: 'Sentir',
    pergunta: 'Onde está o ictus, qual a extensão e há frêmitos ou impulsões?',
    como: 'Palma da mão no precórdio; polpas digitais sobre o ictus.',
    peso: 'alto',
  },
  {
    id: 'ausculta', n: 4, nome: 'Ausculta', verbo: 'Ouvir',
    pergunta: 'Ritmo, B1 e B2, sons extras e sopros: onde estão no ciclo?',
    como: 'Cinco focos e todo o precórdio, em quatro posições, com diafragma e campânula.',
    peso: 'alto',
  },
];

export function roteiro(node) {
  node.innerHTML = `<ol class="rt-track">${ETAPAS.map((e) => `
    <li class="rt-step" data-id="${e.id}">
      <button type="button" class="rt-head" aria-expanded="false">
        <span class="rt-n">${e.n}</span>
        <span class="rt-name">${e.nome}</span>
        <span class="rt-verb">${e.verbo}</span>
      </button>
      <div class="rt-body">
        <p class="rt-q">${e.pergunta}</p>
        <p class="rt-how">${e.como}</p>
        ${e.obs ? `<p class="rt-obs">${e.obs}</p>` : ''}
        <div class="rt-weight ${e.peso}" aria-label="Rendimento diagnóstico ${e.peso}">
          <span></span><span></span><span></span><em>rendimento ${e.peso}</em>
        </div>
      </div>
    </li>`).join('')}</ol>`;
  const steps = [...node.querySelectorAll('.rt-step')];
  const open = (s, on) => { s.classList.toggle('open', on); s.querySelector('.rt-head').setAttribute('aria-expanded', String(on)); };
  steps.forEach((s) => s.querySelector('.rt-head').addEventListener('click', () => open(s, !s.classList.contains('open'))));
  const sync = () => { if (document.body.classList.contains('modo-estudo')) steps.forEach((s) => open(s, true)); };
  sync();
  return { activate: sync };
}
