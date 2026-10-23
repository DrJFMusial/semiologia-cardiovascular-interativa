/**
 * Anatomia funcional interativa: o mesmo coração esquemático do laboratório,
 * parado em diástase, com estruturas destacáveis, ficha de cada estrutura e
 * o percurso do sangue passo a passo (pequena e grande circulação).
 *
 * Decisão de projeto: não há "vista externa". Para a semiotécnica, o que o
 * estudante precisa é a relação câmara -> valva -> vaso que explica os focos
 * e as bulhas; uma vista de superfície acrescentaria detalhe sem uso no exame.
 */
import { createHeart } from '../cycle/heart.js';
import { stateAt } from '../cycle/model.js';
import { button, captureKeys } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';

const INFO = {
  vcs: { nome: 'Veia cava superior', tipo: 'vaso', sangue: 'venoso', funcao: 'Traz ao átrio direito o sangue da cabeça, do pescoço e dos membros superiores.' },
  vci: { nome: 'Veia cava inferior', tipo: 'vaso', sangue: 'venoso', funcao: 'Traz ao átrio direito o sangue do abdome e dos membros inferiores.' },
  ad: { nome: 'Átrio direito', tipo: 'camara', sangue: 'venoso', funcao: 'Recebe o sangue venoso sistêmico e o passa ao ventrículo direito pela valva tricúspide. Sua pressão se reflete nas veias jugulares.' },
  tri: { nome: 'Valva tricúspide', tipo: 'valva', sangue: 'venoso', funcao: 'Valva atrioventricular direita. Seu fechamento, junto com o da mitral, forma a primeira bulha (B1).' },
  vd: { nome: 'Ventrículo direito', tipo: 'camara', sangue: 'venoso', funcao: 'Bombeia o sangue para os pulmões. É a câmara mais anterior: sua sobrecarga produz impulsão paraesternal esquerda.' },
  pu: { nome: 'Valva pulmonar', tipo: 'valva', sangue: 'venoso', funcao: 'Valva semilunar direita. Seu fechamento é o componente P2 da segunda bulha.' },
  tp: { nome: 'Tronco pulmonar', tipo: 'vaso', sangue: 'venoso', funcao: 'Leva sangue pobre em oxigênio aos pulmões. Divide-se nas artérias pulmonares direita e esquerda, sob o arco aórtico.' },
  ap2: { nome: 'Artéria pulmonar direita', tipo: 'vaso', sangue: 'venoso', funcao: 'Ramo do tronco pulmonar que passa atrás da aorta ascendente em direção ao pulmão direito.' },
  vp: { nome: 'Veias pulmonares', tipo: 'vaso', sangue: 'arterial', funcao: 'Trazem dos pulmões ao átrio esquerdo o sangue oxigenado.' },
  ae: { nome: 'Átrio esquerdo', tipo: 'camara', sangue: 'arterial', funcao: 'Recebe o sangue oxigenado e o passa ao ventrículo esquerdo pela valva mitral.' },
  mit: { nome: 'Valva mitral', tipo: 'valva', sangue: 'arterial', funcao: 'Valva atrioventricular esquerda. Seu fechamento é o principal componente da primeira bulha (B1), mais audível no ápice (foco mitral).' },
  ve: { nome: 'Ventrículo esquerdo', tipo: 'camara', sangue: 'arterial', funcao: 'Bombeia o sangue para todo o corpo. Seu ápice, no 5º espaço intercostal, produz o ictus cordis.' },
  ao: { nome: 'Valva aórtica', tipo: 'valva', sangue: 'arterial', funcao: 'Valva semilunar esquerda. Seu fechamento é o componente A2 da segunda bulha (B2).' },
  aorta: { nome: 'Aorta', tipo: 'vaso', sangue: 'arterial', funcao: 'Distribui o sangue oxigenado ao organismo. A pulsação do arco pode ser percebida na fúrcula esternal.' },
};
INFO.vp2 = INFO.vp;

const PERCURSO = [
  ['vcs', 'Sangue venoso chega pelas veias cavas…'], ['ad', '…ao átrio direito.'],
  ['tri', 'Atravessa a valva tricúspide…'], ['vd', '…e enche o ventrículo direito.'],
  ['pu', 'Na sístole, passa pela valva pulmonar…'], ['tp', '…ao tronco pulmonar e aos pulmões.'],
  ['vp', 'Oxigenado, volta pelas veias pulmonares…'], ['ae', '…ao átrio esquerdo.'],
  ['mit', 'Atravessa a valva mitral…'], ['ve', '…e enche o ventrículo esquerdo.'],
  ['ao', 'Na sístole, passa pela valva aórtica…'], ['aorta', '…à aorta e a todo o corpo.'],
];

const VALVE_HIT = { tri: [175, 340, 64, 22], mit: [476, 340, 64, 22], ao: [303, 306, 22, 16], pu: [372, 266, 22, 16] };

export function anatomy(node) {
  node.classList.add('anatomy');
  node.innerHTML = `
    <div class="an-figure" tabindex="0" aria-label="Coração esquemático. Use Tab para percorrer as estruturas."></div>
    <aside class="an-panel">
      <div class="an-filters" role="group" aria-label="Destacar"></div>
      <div class="an-card" aria-live="polite">
        <p class="an-hint">Passe o cursor ou toque em uma estrutura.</p>
      </div>
      <div class="an-route"></div>
    </aside>`;
  const fig = node.querySelector('.an-figure');
  const heart = createHeart(fig, { labels: true });
  heart.setFlow(false);
  heart.update(stateAt(0.7), 1);
  heart.svg.classList.add('anatomy-mode');

  // alvos das valvas (os folhetos são finos demais para o cursor)
  const hitG = document.createElementNS(NS, 'g');
  heart.root.appendChild(hitG);
  for (const [k, [cx, cy, rx, ry]] of Object.entries(VALVE_HIT)) {
    const e = document.createElementNS(NS, 'ellipse');
    Object.entries({ cx, cy, rx, ry, class: 'valve-hit', 'data-part': k }).forEach(([a, v]) => e.setAttribute(a, v));
    hitG.appendChild(e);
  }

  const card = node.querySelector('.an-card');
  const all = [...heart.svg.querySelectorAll('[data-part]')].filter((e) => INFO[e.dataset.part]);
  all.forEach((e) => {
    // a segunda veia pulmonar repete a ficha da primeira: fica fora da ordem de tabulação
    e.setAttribute('tabindex', e.dataset.part === 'vp2' ? '-1' : '0');
    e.setAttribute('role', 'button');
    e.setAttribute('aria-label', INFO[e.dataset.part].nome);
    e.classList.add('hot');
  });

  let filter = 'todos';
  let locked = null;
  function show(part) {
    heart.svg.querySelectorAll('.hot').forEach((e) => {
      const same = part && (e.dataset.part === part || (INFO[part] === INFO[e.dataset.part]));
      e.classList.toggle('sel', !!same);
    });
    heart.svg.classList.toggle('has-sel', !!part);
    if (!part) { card.innerHTML = '<p class="an-hint">Passe o cursor ou toque em uma estrutura.</p>'; return; }
    const i = INFO[part];
    card.innerHTML = `
      <div class="an-tag ${i.sangue}">${i.tipo === 'camara' ? 'câmara' : i.tipo} · sangue ${i.sangue}</div>
      <h4>${i.nome}</h4><p>${i.funcao}</p>`;
  }
  const visible = (e) => filter === 'todos' || INFO[e.dataset.part].tipo === filter;
  all.forEach((e) => {
    e.addEventListener('pointerenter', () => { if (!locked && visible(e)) show(e.dataset.part); });
    e.addEventListener('pointerleave', () => { if (!locked) show(null); });
    e.addEventListener('click', (ev) => { ev.stopPropagation(); if (!visible(e)) return; locked = e.dataset.part; show(locked); });
    e.addEventListener('focus', () => { if (visible(e)) { locked = e.dataset.part; show(locked); } });
  });
  fig.addEventListener('click', () => { locked = null; show(null); });

  // filtros
  const fl = node.querySelector('.an-filters');
  const fb = [['todos', 'Tudo'], ['camara', 'Câmaras'], ['valva', 'Valvas'], ['vaso', 'Vasos']].map(([id, l]) => {
    const b = button({ label: `Destacar: ${l}`, text: l, cls: 'seg', pressed: id === filter });
    b.addEventListener('click', () => {
      filter = id; locked = null; show(null);
      fb.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      heart.svg.dataset.filter = id;
      all.forEach((e) => e.classList.toggle('dim', !visible(e)));
    });
    fl.appendChild(b);
    return b;
  });

  // percurso do sangue
  const route = node.querySelector('.an-route');
  const bRoute = button({ icon: 'play', label: 'Seguir o percurso do sangue', text: 'Seguir o sangue', cls: 'ghost' });
  const bStep = button({ icon: 'next', label: 'Próximo passo do percurso', cls: 'ghost' });
  const cap = document.createElement('p');
  cap.className = 'an-route-cap';
  route.append(bRoute, bStep, cap);
  let ri = -1, timer = 0;
  function routeStep() {
    ri = (ri + 1) % PERCURSO.length;
    const [part, txt] = PERCURSO[ri];
    locked = part; show(part);
    cap.innerHTML = `<b>${ri + 1}/${PERCURSO.length}</b> ${txt}`;
  }
  function stopRoute() { clearInterval(timer); timer = 0; bRoute.querySelector('span').textContent = 'Seguir o sangue'; }
  bRoute.addEventListener('click', () => {
    if (timer) { stopRoute(); return; }
    ri = -1; routeStep();
    bRoute.querySelector('span').textContent = 'Parar';
    timer = setInterval(() => { if (ri === PERCURSO.length - 1) { stopRoute(); return; } routeStep(); }, 1700);
  });
  bStep.addEventListener('click', () => { stopRoute(); routeStep(); });

  captureKeys(node, (e) => {
    if (e.key === 'Escape') { locked = null; show(null); return true; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset?.part) { locked = e.target.dataset.part; show(locked); return true; }
    return false;
  });

  return { deactivate: stopRoute, pause: stopRoute };
}
