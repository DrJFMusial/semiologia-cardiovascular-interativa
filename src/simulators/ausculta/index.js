/**
 * Ausculta multimídia (sons ESQUEMÁTICOS sintetizados no navegador).
 * Sincroniza o áudio com a forma de onda, a régua do ciclo (sístole/diástole)
 * e a marcação de cada evento (B1, B2, B3, B4, A2/P2, sopro).
 * Como a síntese é feita aqui, os marcadores coincidem exatamente com o que
 * se ouve; não são registros clínicos e não ensinam timbre.
 */
import { CASOS, renderCaso, playBuffer, getContext, newBuffer } from '../../core/audio.js';
import { button, setIcon, captureKeys } from '../../core/ui.js';

const ORDEM = ['normal', 'desdobramento', 'b3', 'b4', 'sistolico', 'diastolico'];
const COR = { B1: 'var(--ven)', B2: 'var(--art)', A2: 'var(--art)', P2: '#8a5bb5', B3: 'var(--sound)', B4: 'var(--sound)' };

export function drawWave(canvas, buf, { ciclos, cicloSeg, caso, progress = -1, segmentos = null }) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  const css = getComputedStyle(canvas);
  const c = (v, d) => css.getPropertyValue(v).trim() || d;
  const total = ciclos * cicloSeg;
  const x = (t) => (t / total) * w;
  const top = 26, mid = top + (h - top - 22) / 2, amp = (h - top - 22) / 2 - 4;
  // régua sístole/diástole
  for (let n = 0; n < ciclos; n++) {
    const b = n * cicloSeg, k = cicloSeg / 0.8;
    const cs = segmentos ? segmentos[n] : caso;
    g.fillStyle = c('--ph-ejecao', '#5ea5b2'); g.globalAlpha = 0.18;
    g.fillRect(x(b + 0.12 * k), top, x(0.3 * k), h - top - 22);
    g.globalAlpha = 1;
    g.fillStyle = c('--ink-3', '#6b7d89'); g.font = '600 11px Inter Variable, sans-serif';
    g.textAlign = 'center';
    if (x(cicloSeg) > 150) { // em telas estreitas, rótulos só no primeiro ciclo
      g.fillText('sístole', x(b + 0.27 * k), h - 6);
      g.fillText('diástole', x(b + 0.61 * k), h - 6);
    } else if (n === 0) {
      g.fillText('sís', x(b + 0.27 * k), h - 6);
      g.fillText('diás', x(b + 0.61 * k), h - 6);
    }
    // marcadores dos eventos
    const insp = cs.alterna ? n % 2 === 1 : false;
    for (const ev of cs.eventos) {
      if (ev.inspiracao && !insp) continue;
      let tipo = ev.tipo;
      if (cs.alterna && tipo === 'A2' && !insp) tipo = 'B2';
      const xx = x(b + ev.t * k);
      g.strokeStyle = COR[tipo]; g.lineWidth = 1.5; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(xx, top - 2); g.lineTo(xx, h - 22); g.stroke(); g.setLineDash([]);
      g.fillStyle = COR[tipo]; g.font = '700 12px Inter Variable, sans-serif';
      g.fillText(tipo, xx + (tipo === 'P2' ? 9 : 0), 15);
    }
    if (cs.sopro) {
      g.fillStyle = c('--sound', '#c98a12'); g.globalAlpha = 0.16;
      g.fillRect(x(b + cs.sopro.t0 * k), top, x((cs.sopro.t1 - cs.sopro.t0) * k), h - top - 22);
      g.globalAlpha = 1;
    }
    if (cs.alterna) {
      g.fillStyle = c('--ink-3', '#6b7d89'); g.font = '500 11px Inter Variable, sans-serif';
      g.fillText(insp ? 'inspiração' : 'expiração', x(b + 0.06 * k) + 24, top + 12);
    }
    if (segmentos) {
      g.fillStyle = c('--ink-2', '#3c4f5c'); g.font = '600 11px Inter Variable, sans-serif'; g.textAlign = 'left';
      if (n === 0 || segmentos[n] !== segmentos[n - 1]) g.fillText(segmentos[n].nome, x(b) + 4, top + 12);
      g.textAlign = 'center';
    }
  }
  // forma de onda (envelope min/max por coluna)
  const d = buf.getChannelData(0);
  const step = d.length / w;
  g.strokeStyle = c('--petrol', '#0e5462'); g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < w; i++) {
    let mn = 1, mx = -1;
    const a = Math.floor(i * step), b = Math.floor((i + 1) * step);
    for (let j = a; j < b; j++) { const v = d[j]; if (v < mn) mn = v; if (v > mx) mx = v; }
    g.moveTo(i + 0.5, mid - mx * amp); g.lineTo(i + 0.5, mid - mn * amp);
  }
  g.stroke();
  // cursor de reprodução
  if (progress >= 0) {
    g.strokeStyle = c('--ink', '#10212b'); g.lineWidth = 2;
    g.beginPath(); g.moveTo(progress * w, top - 4); g.lineTo(progress * w, h - 20); g.stroke();
  }
}

export function ausculta(node) {
  node.classList.add('ausculta');
  node.innerHTML = `
    <div class="au-list" role="radiogroup" aria-label="Escolha o som"></div>
    <div class="au-main">
      <div class="au-head">
        <div>
          <h4 class="au-title"></h4>
          <p class="au-ono mono"></p>
        </div>
        <span class="au-badge">Som sintetizado esquemático</span>
      </div>
      <canvas class="au-wave" aria-hidden="true"></canvas>
      <div class="au-controls"></div>
      <p class="au-caption" aria-live="polite"></p>
      <p class="au-desc"></p>
    </div>`;
  const list = node.querySelector('.au-list');
  const canvas = node.querySelector('.au-wave');
  const title = node.querySelector('.au-title');
  const ono = node.querySelector('.au-ono');
  const caption = node.querySelector('.au-caption');
  const desc = node.querySelector('.au-desc');

  let atual = 'normal';
  let lento = false;
  let comparar = false;
  let loop = true;
  let player = null;
  let raf = 0;
  let buf = null, meta = null;

  const bPlay = button({ icon: 'play', label: 'Ouvir', text: 'Ouvir', cls: 'primary' });
  const bLoop = button({ icon: 'loop', label: 'Repetir continuamente', text: 'Repetir', cls: 'chip', pressed: true });
  const bSlow = button({ label: 'Andamento lento (50 bpm) para estudo', text: '50 bpm', cls: 'chip', pressed: false });
  const bCmp = button({ label: 'Comparar com B1 e B2 normais', text: 'Comparar com o normal', cls: 'chip', pressed: false });
  node.querySelector('.au-controls').append(bPlay, bLoop, bSlow, bCmp);

  const items = ORDEM.map((id) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'au-item'; b.setAttribute('role', 'radio');
    b.innerHTML = `<span class="au-item-n">${CASOS[id].nome}</span><span class="au-item-o mono">${CASOS[id].onomatopeia}</span>`;
    b.addEventListener('click', () => select(id));
    list.appendChild(b);
    return [id, b];
  });

  function build() {
    const cicloSeg = lento ? 1.2 : 0.8;
    if (comparar && atual !== 'normal') {
      const ciclos = 4;
      const a = renderCaso('normal', 2, cicloSeg), b = renderCaso(atual, 2, cicloSeg);
      buf = newBuffer(a.length + b.length);
      buf.getChannelData(0).set(a.getChannelData(0), 0);
      buf.getChannelData(0).set(b.getChannelData(0), a.length);
      meta = { ciclos, cicloSeg, caso: CASOS[atual], segmentos: [CASOS.normal, CASOS.normal, CASOS[atual], CASOS[atual]] };
    } else {
      const ciclos = 4;
      buf = renderCaso(atual, ciclos, cicloSeg);
      meta = { ciclos, cicloSeg, caso: CASOS[atual] };
    }
    drawWave(canvas, buf, meta);
  }
  function stop() {
    player?.stop(); player = null; cancelAnimationFrame(raf);
    setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir';
    if (buf) drawWave(canvas, buf, meta);
  }
  function play() {
    stop();
    build();
    player = playBuffer(buf, { loop });
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
    const ctx = getContext();
    const tick = () => {
      if (!player) return;
      const el = ctx.currentTime - player.startedAt;
      if (!loop && el > player.duration) { stop(); return; }
      const p = el < 0 ? 0 : (el % player.duration) / player.duration;
      drawWave(canvas, buf, { ...meta, progress: p });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function select(id) {
    const tocando = !!player;
    stop();
    atual = id;
    items.forEach(([k, b]) => { b.setAttribute('aria-checked', String(k === id)); b.classList.toggle('on', k === id); });
    const c = CASOS[id];
    title.textContent = c.nome;
    ono.textContent = c.onomatopeia;
    caption.textContent = `O que se ouve: ${c.legenda}`;
    desc.textContent = c.descricao;
    bCmp.disabled = id === 'normal';
    try { build(); } catch { /* contexto de áudio ainda não liberado: desenha no primeiro clique */ }
    if (tocando) play();
  }

  bPlay.addEventListener('click', () => (player ? stop() : play()));
  bLoop.addEventListener('click', () => { loop = !loop; bLoop.setAttribute('aria-pressed', String(loop)); if (player) play(); });
  bSlow.addEventListener('click', () => { lento = !lento; bSlow.setAttribute('aria-pressed', String(lento)); if (player) play(); else build(); });
  bCmp.addEventListener('click', () => { comparar = !comparar; bCmp.setAttribute('aria-pressed', String(comparar)); if (player) play(); else build(); });
  captureKeys(node, (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const i = ORDEM.indexOf(atual) + (e.key === 'ArrowDown' ? 1 : -1);
      select(ORDEM[(i + ORDEM.length) % ORDEM.length]); items[ORDEM.indexOf(atual)][1].focus();
      return true;
    }
    return false;
  });
  new ResizeObserver(() => buf && drawWave(canvas, buf, meta)).observe(canvas);

  // os buffers são criados sem AudioContext; o contexto só nasce no primeiro clique
  select('normal');
  return { deactivate: stop, pause: stop };
}
