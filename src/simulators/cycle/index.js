/**
 * Laboratório do ciclo cardíaco: coração esquemático + traçados sincronizados,
 * com controles de execução, passo a passo por fase, velocidade, seleção de
 * fase, camadas e som esquemático das bulhas.
 */
import { T, PHASES, EVENTS, stateAt, phaseAt } from './model.js';
import { createHeart } from './heart.js';
import { createPlots } from './plots.js';
import { button, setIcon, captureKeys, prefersReducedMotion } from '../../core/ui.js';
import { thump } from '../../core/audio.js';
import { advanceFrame } from './transport.js';

const SPEEDS = [
  { v: 0.1, l: '0,1×' }, { v: 0.25, l: '0,25×' }, { v: 0.5, l: '0,5×' }, { v: 1, l: '1×' },
];

export function cycleLab(node) {
  node.classList.add('cycle-lab');
  node.tabIndex = 0;
  node.setAttribute('role', 'application');
  node.setAttribute('aria-label', 'Laboratório do ciclo cardíaco. Espaço: reproduzir ou pausar. Setas: fase anterior ou seguinte. Shift e setas: quadro anterior ou seguinte de 10 ms.');
  node.innerHTML = `
    <div class="cl-left">
      <div class="cl-phase" aria-live="polite">
        <div class="cl-phase-n"></div>
        <div>
          <div class="cl-phase-name"></div>
          <div class="cl-phase-sum"></div>
        </div>
      </div>
      <div class="cl-heart"></div>
      <div class="cl-readout">
        <div><span class="k">Valvas AV</span><span class="v" data-r="av"></span></div>
        <div><span class="k">Semilunares</span><span class="v" data-r="semi"></span></div>
        <div><span class="k">Volume VE</span><span class="v mono" data-r="vol"></span></div>
        <div><span class="k">Pressão VE</span><span class="v mono" data-r="pve"></span></div>
      </div>
    </div>
    <div class="cl-right">
      <div class="cl-plots"></div>
      <p class="cl-model-note estudo-only">Curvas qualitativas e fases prescritas: não usar os números para calcular gradientes de pressão. Os dois lados do coração compartilham uma dinâmica simplificada. Em slides estreitas, deslize os traçados horizontalmente.</p>
      <div class="cl-detail estudo-only"></div>
    </div>
    <div class="cl-controls">
      <div class="grp transport"></div>
      <div class="grp speed" role="radiogroup" aria-label="Velocidade"></div>
      <div class="grp layers" aria-label="Camadas"></div>
      <div class="grp frames" aria-label="Avanço por quadro"></div>
      <div class="cl-note">Modelo esquemático: valores ilustrativos. Quadros de 10 ms (Shift + setas). B3/B4 opcionais não representam o ciclo normal habitual.</div>
    </div>`;

  const heart = createHeart(node.querySelector('.cl-heart'));
  let t = 0.0; // tempo no ciclo (s)
  let playing = false;
  let speed = 0.25;
  let last = null;
  let raf = 0;
  let soundOn = false;
  let active = false;

  const plots = createPlots(node.querySelector('.cl-plots'), {
    onSeek: (tt) => { pause(); t = tt; render(0.05); },
    onPhase: (id) => goPhase(id),
  });

  // ---- controles ------------------------------------------------------------
  const tr = node.querySelector('.transport');
  const bPrev = button({ icon: 'prev', label: 'Fase anterior (seta esquerda)' });
  const bPlay = button({ icon: 'play', label: 'Reproduzir (espaço)', cls: 'primary' });
  const bNext = button({ icon: 'next', label: 'Próxima fase (seta direita)' });
  const bReset = button({ icon: 'restart', label: 'Reiniciar' });
  const bSound = button({ icon: 'mute', label: 'Som esquemático das bulhas', text: 'Som', pressed: false });
  tr.append(bPrev, bPlay, bNext, bReset, bSound);
  const bFramePrev = button({ label: 'Quadro anterior de 10 ms (Shift + seta esquerda)', text: '−10 ms' });
  const bFrameNext = button({ label: 'Próximo quadro de 10 ms (Shift + seta direita)', text: '+10 ms' });
  const clock = document.createElement('output');
  clock.className = 'mono cl-clock';
  clock.setAttribute('aria-label', 'Tempo no ciclo');
  node.querySelector('.frames').append(bFramePrev, clock, bFrameNext);

  const sp = node.querySelector('.speed');
  const spBtns = SPEEDS.map((s) => {
    const b = button({ label: `Velocidade ${s.l}`, text: s.l, cls: 'seg', pressed: s.v === speed });
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(s.v === speed));
    b.addEventListener('click', () => {
      speed = s.v;
      spBtns.forEach((x, i) => { const on = SPEEDS[i].v === speed; x.setAttribute('aria-checked', on); x.setAttribute('aria-pressed', on); });
    });
    sp.appendChild(b);
    return b;
  });

  const layersDef = [
    ['fluxo', 'Fluxo', true], ['legendas', 'Rótulos', true], ['ecg', 'ECG', true],
    ['pressao', 'Pressões', true], ['volume', 'Volume', true], ['sons', 'Sons', true], ['b34', 'B3/B4', false],
  ];
  const ly = node.querySelector('.layers');
  const layerState = {};
  for (const [id, l, on] of layersDef) {
    layerState[id] = on;
    const b = button({ label: `Mostrar ou ocultar: ${l}`, text: l, cls: 'chip', pressed: on });
    b.addEventListener('click', () => {
      layerState[id] = !layerState[id];
      b.setAttribute('aria-pressed', String(layerState[id]));
      applyLayer(id);
    });
    ly.appendChild(b);
  }
  function applyLayer(id) {
    const on = layerState[id];
    if (id === 'fluxo') heart.setFlow(on);
    else if (id === 'legendas') heart.setLabels(on);
    else if (id === 'b34') plots.setExtraSounds({ b3: on, b4: on });
    else plots.setLayer(id, on);
  }

  // ---- lógica temporal ------------------------------------------------------------
  const detail = node.querySelector('.cl-detail');
  const ph = {
    n: node.querySelector('.cl-phase-n'),
    name: node.querySelector('.cl-phase-name'),
    sum: node.querySelector('.cl-phase-sum'),
  };
  const r = Object.fromEntries([...node.querySelectorAll('[data-r]')].map((e) => [e.dataset.r, e]));
  let shownPhase = null;

  function render(dtReal) {
    const st = stateAt(t);
    heart.update(st, dtReal);
    plots.update(st);
    clock.textContent = `${Math.round(st.t * 1000)} / 800 ms`;
    node.dataset.time = st.t;
    if (shownPhase !== st.phase.id) {
      shownPhase = st.phase.id;
      ph.n.textContent = st.phase.n;
      ph.name.textContent = st.phase.nome;
      ph.sum.textContent = st.phase.resumo;
      detail.innerHTML = `<h4>${st.phase.nome}</h4><p>${st.phase.detalhe}</p>`;
      node.dataset.phase = st.phase.id;
    }
    r.av.textContent = st.avOpen ? 'abertas' : 'fechadas';
    r.av.className = `v ${st.avOpen ? 'open' : 'closed'}`;
    r.semi.textContent = st.semiOpen ? 'abertas' : 'fechadas';
    r.semi.className = `v ${st.semiOpen ? 'open' : 'closed'}`;
    r.vol.textContent = `${Math.round(st.vol)} mL`;
    r.pve.textContent = `${Math.round(st.pve)} mmHg`;
  }

  function frame(now) {
    if (!playing) return;
    const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    const prev = t;
    t = (t + dt * speed) % T;
    // bulhas audíveis quando o cursor cruza os eventos
    if (soundOn) {
      const crossed = (ev) => (prev <= ev && t > ev) || (prev > t && (ev >= prev || ev < t));
      if (crossed(EVENTS.B1)) thump('B1');
      if (crossed(EVENTS.B2)) thump('B2');
      if (layerState.b34 && crossed(EVENTS.B3)) thump('B3');
      if (layerState.b34 && crossed(EVENTS.B4)) thump('B4');
    }
    render(dt);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (playing) return;
    if (prefersReducedMotion() && speed > 0.25) speed = 0.25;
    playing = true; last = null;
    setIcon(bPlay, 'pause'); bPlay.setAttribute('aria-label', 'Pausar (espaço)'); bPlay.title = 'Pausar (espaço)';
    node.classList.add('playing');
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    playing = false; cancelAnimationFrame(raf);
    setIcon(bPlay, 'play'); bPlay.setAttribute('aria-label', 'Reproduzir (espaço)'); bPlay.title = 'Reproduzir (espaço)';
    node.classList.remove('playing');
  }
  function goPhase(id) {
    pause();
    const p = PHASES.find((x) => x.id === id);
    t = p.t0 + Math.min(0.012, (p.t1 - p.t0) / 3);
    heart.reset();
    render(0.05);
    if (soundOn && (id === 'ivc')) thump('B1');
    if (soundOn && (id === 'ivr')) thump('B2');
  }
  function step(dir) {
    const cur = phaseAt(t);
    const i = PHASES.indexOf(cur);
    goPhase(PHASES[(i + dir + PHASES.length) % PHASES.length].id);
  }
  function frameStep(dir) {
    pause();
    t = advanceFrame(t, dir);
    heart.reset();
    render(0);
  }
  bFramePrev.addEventListener('click', () => frameStep(-1));
  bFrameNext.addEventListener('click', () => frameStep(1));

  bPlay.addEventListener('click', () => (playing ? pause() : play()));
  bPrev.addEventListener('click', () => step(-1));
  bNext.addEventListener('click', () => step(1));
  bReset.addEventListener('click', () => { pause(); t = 0; heart.reset(); render(0.05); });
  bSound.addEventListener('click', () => {
    soundOn = !soundOn;
    bSound.setAttribute('aria-pressed', String(soundOn));
    setIcon(bSound, soundOn ? 'sound' : 'mute');
    if (soundOn) thump('B1');
  });

  captureKeys(node, (e) => {
    if (e.target !== node && e.target.closest('.cl-controls') && (e.key === ' ' || e.key === 'Enter')) return false;
    if (e.key === ' ' || e.key === 'k') { playing ? pause() : play(); return true; }
    if (e.key === 'ArrowRight') { e.shiftKey ? frameStep(1) : step(1); return true; }
    if (e.key === 'ArrowLeft') { e.shiftKey ? frameStep(-1) : step(-1); return true; }
    if (e.key === 'Home') { pause(); t = 0; render(0.05); return true; }
    return false;
  });

  // estado inicial: início da contração isovolumétrica? Não: começa na sístole atrial.
  t = 0.02;
  render(0.05);

  return {
    activate() { active = true; },
    deactivate() { active = false; pause(); },
    pause,
  };
}
