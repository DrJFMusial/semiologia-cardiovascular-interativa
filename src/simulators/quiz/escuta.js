/**
 * Atividade "Escute e identifique": toca um som esquemático sorteado; o
 * estudante escolhe a identificação e recebe feedback explicativo que
 * compara a sua hipótese com o que de fato ocorre no ciclo. Depois da
 * resposta, a forma de onda com os eventos é revelada.
 * Sem notas, sem armazenamento de dados.
 */
import { CASOS, renderCaso, playBuffer } from '../../core/audio.js';
import { drawWave } from '../ausculta/index.js';
import { button, setIcon } from '../../core/ui.js';

const IDS = ['normal', 'desdobramento', 'b3', 'b4', 'sistolico', 'diastolico'];

/** Pista conceitual para cada confusão provável (escolha -> correto). */
const PISTA = {
  b3: 'B3 vem logo DEPOIS de B2, no início da diástole (TUM-TA-tu).',
  b4: 'B4 vem logo ANTES de B1, no fim da diástole (tu-TUM-TA).',
  sistolico: 'Um sopro sistólico preenche o intervalo entre B1 e B2 (pequeno silêncio).',
  diastolico: 'Um sopro diastólico começa depois de B2 e ocupa o grande silêncio.',
  desdobramento: 'No desdobramento fisiológico, B2 se divide em dois sons próximos só em alguns ciclos (inspiração).',
  normal: 'No ritmo normal há apenas dois sons por ciclo, e os silêncios são limpos.',
};

export function escuta(node) {
  node.classList.add('quiz-escuta');
  node.innerHTML = `
    <div class="qe-top">
      <p class="qe-kicker">Atividade · <span class="qe-n">1</span>/5</p>
      <span class="au-badge">Som sintetizado esquemático</span>
    </div>
    <h4 class="qe-q">Ouça o som e identifique o que há de diferente.</h4>
    <div class="qe-play"></div>
    <div class="qe-opts" role="group" aria-label="Respostas"></div>
    <div class="qe-fb" aria-live="polite"></div>
    <canvas class="qe-wave" aria-hidden="true"></canvas>
    <div class="qe-next"></div>`;
  const opts = node.querySelector('.qe-opts');
  const fb = node.querySelector('.qe-fb');
  const canvas = node.querySelector('.qe-wave');
  const nEl = node.querySelector('.qe-n');
  const bPlay = button({ icon: 'play', label: 'Ouvir o som', text: 'Ouvir', cls: 'primary' });
  node.querySelector('.qe-play').appendChild(bPlay);
  const bNext = button({ icon: 'next', label: 'Próximo som', text: 'Próximo', cls: 'ghost' });
  node.querySelector('.qe-next').appendChild(bNext);

  let fila = [], atual = null, buf = null, player = null, n = 0, acertos = 0, respondido = false;
  function stop() { player?.stop(); player = null; setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir'; }
  function nova() {
    stop();
    if (!fila.length) { fila = [...IDS].sort(() => Math.random() - 0.5).slice(0, 5); n = 0; acertos = 0; }
    atual = fila.shift(); n++;
    nEl.textContent = n;
    buf = renderCaso(atual, 4, 0.9);
    respondido = false;
    fb.innerHTML = '';
    canvas.classList.remove('show');
    bNext.style.visibility = 'hidden';
    opts.innerHTML = '';
    IDS.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'qe-opt'; b.textContent = CASOS[id].nome;
      b.addEventListener('click', () => responder(id, b));
      opts.appendChild(b);
    });
  }
  function responder(id, b) {
    if (respondido) return;
    respondido = true;
    const ok = id === atual;
    if (ok) acertos++;
    opts.querySelectorAll('.qe-opt').forEach((x) => {
      x.disabled = true;
      if (x.textContent === CASOS[atual].nome) x.classList.add('right');
    });
    if (!ok) b.classList.add('wrong');
    const c = CASOS[atual];
    fb.innerHTML = ok
      ? `<div class="fb ok"><p><b>Correto: ${c.nome}.</b> ${c.legenda}</p></div>`
      : `<div class="fb no"><p><b>Era ${c.nome.toLowerCase()}.</b> ${c.legenda}</p>
         <p>Sobre a sua escolha: ${PISTA[id]}</p></div>`;
    canvas.classList.add('show');
    requestAnimationFrame(() => drawWave(canvas, buf, { ciclos: 4, cicloSeg: 0.9, caso: c }));
    bNext.style.visibility = 'visible';
    bNext.querySelector('span').textContent = fila.length ? 'Próximo' : `Recomeçar (acertos: ${acertos}/5)`;
  }
  bPlay.addEventListener('click', () => {
    if (player) { stop(); return; }
    player = playBuffer(buf, { loop: true });
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
  });
  bNext.addEventListener('click', nova);
  nova();
  return { deactivate: stop, pause: stop };
}
