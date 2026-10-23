/**
 * Edema com cacifo: corte esquemático da pele sobre a tíbia. O polegar
 * pressiona por 2 a 3 s e a depressão retorna num tempo que depende do grau.
 * O retorno é mostrado acelerado, com o tempo real indicado.
 * Graus (referência didática; as escalas variam entre livros):
 *  1+ ≈ 2 mm, some rapidamente; 2+ ≈ 4 mm, 10 a 15 s; 3+ ≈ 6 mm, cerca de 1 min;
 *  4+ ≈ 8 mm, 2 a 5 min.
 */
import { button, prefersReducedMotion } from '../../core/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p?.appendChild(e); return e; };

const GRAUS = {
  1: { mm: 2, real: 2, txt: 'cerca de 2 mm; desaparece rapidamente' },
  2: { mm: 4, real: 12, txt: 'cerca de 4 mm; desaparece em 10 a 15 s' },
  3: { mm: 6, real: 60, txt: 'cerca de 6 mm; dura cerca de 1 min' },
  4: { mm: 8, real: 180, txt: '8 mm ou mais; persiste por 2 a 5 min' },
};

export function edema(node) {
  node.classList.add('edema');
  node.innerHTML = `
    <svg class="ed-svg" viewBox="0 0 520 300" role="img" aria-label="Corte da pele sobre a tíbia com a depressão do cacifo"></svg>
    <div class="ed-ctrl">
      <div class="ed-graus" role="radiogroup" aria-label="Grau do edema"></div>
      <div class="ed-act"></div>
      <p class="ed-read mono" aria-live="polite"></p>
    </div>`;
  const svg = node.querySelector('svg');
  el('rect', { x: 0, y: 0, width: 520, height: 300, class: 'ed-bg' }, svg);
  const tissue = el('path', { class: 'ed-tissue' }, svg);
  const skin = el('path', { class: 'ed-skin' }, svg);
  el('path', { d: 'M40 260 Q260 228 480 260 L480 300 L40 300 Z', class: 'ed-bone' }, svg);
  const tb = el('text', { x: 260, y: 288, class: 'ed-t' }, svg); tb.textContent = 'tíbia';
  const thumb = el('g', { class: 'ed-thumb' }, svg);
  el('path', { d: 'M232 -120 L232 -14 Q232 6 260 6 Q288 6 288 -14 L288 -120 Z' }, thumb);
  el('path', { d: 'M240 -12 Q260 0 280 -12', class: 'nail' }, thumb);
  const ruler = el('g', { class: 'ed-ruler' }, svg);
  const rl = el('line', { x1: 320, x2: 320 }, ruler);
  const rt = el('text', { x: 330 }, ruler);

  let grau = 2, depth = 0, raf = 0, fase = 'livre', tRel = 0;
  const SURF = 120;     // superfície da pele (px)
  const MM = 7;         // px por mm (desenho ampliado)
  const read = node.querySelector('.ed-read');
  function reset() {
    cancelAnimationFrame(raf); fase = 'livre'; depth = 0;
    setThumb(-160); shape(0);
    read.textContent = `Grau ${grau}+: ${GRAUS[grau].txt}.`;
  }

  function shape(dp) {
    const y = SURF, w = 46 + dp * 1.5;
    const pit = dp > 0.2 ? `L${260 - w - 30} ${y} C${260 - w} ${y} ${260 - w * 0.6} ${y + dp} 260 ${y + dp} C${260 + w * 0.6} ${y + dp} ${260 + w} ${y} ${260 + w + 30} ${y}` : '';
    skin.setAttribute('d', `M20 ${y} ${pit} L500 ${y}`);
    tissue.setAttribute('d', `M20 ${y} ${pit} L500 ${y} L500 262 L20 262 Z`);
    ruler.style.display = dp > 2 ? '' : 'none';
    rl.setAttribute('y1', y); rl.setAttribute('y2', y + dp);
    rt.setAttribute('y', y + dp / 2 + 5); rt.textContent = `${(dp / MM).toFixed(0)} mm`;
  }
  function setThumb(y) { thumb.setAttribute('transform', `translate(0 ${y})`); }

  function press() {
    cancelAnimationFrame(raf);
    const g = GRAUS[grau], alvo = g.mm * MM, t0 = performance.now();
    const fast = prefersReducedMotion();
    const PRESS = fast ? 1 : 2500, VOLTA = fast ? 1 : 3000 + grau * 1500; // ms de animação
    fase = 'press';
    const step = (now) => {
      const t = now - t0;
      if (t < 400) { setThumb(-140 + (t / 400) * (SURF + 140 - 6) ); depth = 0; }
      else if (t < 400 + PRESS) { const k = Math.min(1, (t - 400) / 600); depth = alvo * k; setThumb(SURF - 6 + depth); read.textContent = `Pressionando… ${((t - 400) / 1000).toFixed(1).replace('.', ',')} s`; }
      else if (t < 900 + PRESS) { setThumb(SURF - 6 + depth - ((t - 400 - PRESS) / 500) * (SURF + 140)); }
      else {
        const k = Math.min(1, (t - 900 - PRESS) / VOLTA);
        depth = alvo * (1 - k) ** 1.6;
        setThumb(-160);
        read.textContent = `Grau ${grau}+: ${g.txt}. Tempo real ≈ ${Math.round(g.real * k)} s (animação acelerada).`;
        if (k >= 1) { fase = 'livre'; shape(0); return; }
      }
      shape(depth);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  const gb = [1, 2, 3, 4].map((n) => {
    const b = button({ label: `Grau ${n}+`, text: `${n}+`, cls: 'seg', pressed: n === grau });
    b.addEventListener('click', () => { grau = n; reset(); gb.forEach((x, i) => x.setAttribute('aria-pressed', String(i + 1 === grau))); });
    node.querySelector('.ed-graus').appendChild(b);
    return b;
  });
  const bp = button({ icon: 'play', label: 'Pressionar com o polegar por 2 a 3 s', text: 'Pressionar', cls: 'primary' });
  bp.addEventListener('click', press);
  node.querySelector('.ed-act').appendChild(bp);
  setThumb(-160); shape(0);
  read.textContent = `Grau ${grau}+: ${GRAUS[grau].txt}.`;
  return { deactivate: reset, pause() { cancelAnimationFrame(raf); } };
}
