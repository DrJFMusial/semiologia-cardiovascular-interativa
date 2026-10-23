/**
 * Motor de áudio (Web Audio API).
 * - Nenhum som toca sem gesto do usuário: o AudioContext só é criado/retomado
 *   dentro de um clique ou tecla.
 * - Volume mestre e mudo globais, controlados pela barra da aplicação.
 * - Sons cardíacos SINTETIZADOS e ESQUEMÁTICOS: servem para treinar ritmo e
 *   cronologia (onde cada som cai no ciclo), não timbre. Não são registros
 *   fonocardiográficos clínicos.
 */
let ctx = null;
let master = null;
let volume = 0.8;
let muted = false;
const listeners = new Set();

export function getContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function out() { getContext(); return master; }
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  listeners.forEach((f) => f({ volume, muted }));
}
export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  listeners.forEach((f) => f({ volume, muted }));
}
export function audioState() { return { volume, muted }; }
export function onAudioChange(f) { listeners.add(f); return () => listeners.delete(f); }

/* ------------------------------------------------------------------------ */
/* Síntese de sons cardíacos esquemáticos                                     */
/* ------------------------------------------------------------------------ */

/**
 * Um "som" é um pacote de ruído filtrado com envelope curto.
 * f: frequência central (Hz); dur: duração (s); amp: amplitude relativa.
 */
function addBurst(data, sr, t0, { dur, f, amp, q = 1.2 }) {
  const n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr);
  // ressonador de segunda ordem excitado por ruído: soa como "batida" grave
  const w = (2 * Math.PI * f) / sr, r = Math.exp(-w / (2 * q));
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n && i0 + i < data.length; i++) {
    const x = (Math.random() * 2 - 1);
    const env = Math.sin((Math.PI * i) / n) ** 1.5;
    const y = x * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2;
    y2 = y1; y1 = y;
    data[i0 + i] += amp * env * y * 6;
  }
}
function addMurmur(data, sr, t0, t1, shape, { f = 180, amp = 0.3 }) {
  // ruído de banda mais alta, modulado pela forma (diamante, platô, decrescendo)
  const i0 = Math.floor(t0 * sr), i1 = Math.floor(t1 * sr), n = i1 - i0;
  const w = (2 * Math.PI * f) / sr, r = 0.93;
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n && i0 + i < data.length; i++) {
    const u = i / n;
    let env = 1;
    if (shape === 'diamante') env = u < 0.5 ? u * 2 : (1 - u) * 2;
    if (shape === 'plato') env = Math.min(1, u * 12, (1 - u) * 12);
    if (shape === 'decrescendo') env = Math.min(1, u * 14) * (1 - u) ** 1.2;
    const x = Math.random() * 2 - 1;
    const y = x * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2;
    y2 = y1; y1 = y;
    data[i0 + i] += amp * env * y * 4;
  }
}

/**
 * Catálogo didático. Tempos em segundos dentro de um ciclo de 0,8 s
 * (mesma base do laboratório do ciclo cardíaco).
 * Cada caso declara os eventos para que a interface marque exatamente
 * o que se ouve.
 */
export const CASOS = {
  normal: {
    nome: 'B1 e B2 normais', onomatopeia: 'TUM-TA',
    descricao: 'Ritmo em dois tempos. B1 (fechamento das valvas mitral e tricúspide) é mais grave e um pouco mais longa; B2 (fechamento das semilunares) é mais curta e seca. O pequeno silêncio (sístole) é mais curto que o grande silêncio (diástole).',
    legenda: 'Dois sons por ciclo: B1 mais grave, depois B2 mais seca; pausa maior antes do próximo B1.',
    eventos: [{ t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'B2' }],
  },
  desdobramento: {
    nome: 'Desdobramento fisiológico de B2', onomatopeia: 'TUM-TLA',
    descricao: 'Na inspiração, o componente pulmonar (P2) atrasa em relação ao aórtico (A2) e B2 se separa em dois sons próximos; na expiração, voltam a se fundir. Melhor ouvido no foco pulmonar. Neste exemplo, ciclos alternados simulam expiração e inspiração.',
    legenda: 'Ciclos alternados: B2 única (expiração) e B2 dupla, A2 seguida de P2 (inspiração).',
    eventos: [{ t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'A2' }, { t: 0.465, tipo: 'P2', inspiracao: true }],
    alterna: true,
  },
  b3: {
    nome: 'Terceira bulha (B3)', onomatopeia: 'TUM-TA-tu',
    descricao: 'Som grave logo após B2, no fim do enchimento ventricular rápido. Pode ser normal em crianças e adultos jovens; no adulto, sugere disfunção ventricular ou grande fluxo de enchimento. Procure com a campânula, no ápice, em decúbito lateral esquerdo.',
    legenda: 'Três sons: B1, B2 e um terceiro som grave e fraco logo depois de B2.',
    eventos: [{ t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'B2' }, { t: 0.6, tipo: 'B3' }],
  },
  b4: {
    nome: 'Quarta bulha (B4)', onomatopeia: 'tu-TUM-TA',
    descricao: 'Som grave logo antes de B1, durante a contração atrial contra um ventrículo pouco complacente. Pode ser ouvido em crianças e adultos jovens; no adulto, interpretar no contexto. Campânula, ápice, decúbito lateral esquerdo.',
    legenda: 'Três sons: um som grave e fraco logo antes de B1, depois B1 e B2.',
    eventos: [{ t: 0.075, tipo: 'B4' }, { t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'B2' }],
  },
  sistolico: {
    nome: 'Sopro sistólico de ejeção', onomatopeia: 'TUM-shhh-TA',
    descricao: 'Ruído entre B1 e B2: começa pouco depois de B1, cresce e decresce (forma em diamante) e termina antes de B2. A pergunta-chave é: o ruído está entre B1 e B2 (sístole)? Use o pulso carotídeo como referência.',
    legenda: 'Ruído soprante crescente e decrescente entre B1 e B2; diástole silenciosa.',
    eventos: [{ t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'B2' }],
    sopro: { t0: 0.17, t1: 0.39, forma: 'diamante', fase: 'sístole' },
  },
  diastolico: {
    nome: 'Sopro diastólico', onomatopeia: 'TUM-TA-shhh',
    descricao: 'Ruído que começa logo após B2, mais intenso no início e decrescente (protodiastólico). Sopro diastólico sempre deve ser investigado. Muitos são suaves e só aparecem em posição adequada (sentado, inclinado para a frente, em expiração).',
    legenda: 'Ruído soprante decrescente logo após B2; sístole sem ruído.',
    eventos: [{ t: 0.12, tipo: 'B1' }, { t: 0.42, tipo: 'B2' }],
    sopro: { t0: 0.43, t1: 0.7, forma: 'decrescendo', fase: 'diástole' },
  },
};

const BURST = {
  B1: { dur: 0.07, f: 55, amp: 1.0 },
  B2: { dur: 0.05, f: 75, amp: 0.85 },
  A2: { dur: 0.045, f: 78, amp: 0.85 },
  P2: { dur: 0.04, f: 82, amp: 0.6 },
  B3: { dur: 0.045, f: 34, amp: 0.55 },
  B4: { dur: 0.045, f: 34, amp: 0.5 },
};

/** Renderiza N ciclos de um caso num AudioBuffer (offline, determinístico no tempo). */
export const SR = 44100;
export function newBuffer(length) { return new AudioBuffer({ length, numberOfChannels: 1, sampleRate: SR }); }

export function renderCaso(id, ciclos = 4, cicloSeg = 0.8) {
  const sr = SR;
  const caso = CASOS[id];
  const k = cicloSeg / 0.8;
  const buf = newBuffer(Math.ceil(sr * cicloSeg * ciclos));
  const d = buf.getChannelData(0);
  for (let n = 0; n < ciclos; n++) {
    const base = n * cicloSeg;
    const insp = caso.alterna ? n % 2 === 1 : false;
    for (const ev of caso.eventos) {
      if (ev.inspiracao && !insp) continue;
      let tipo = ev.tipo;
      if (caso.alterna && tipo === 'A2' && !insp) tipo = 'B2';
      addBurst(d, sr, base + ev.t * k, BURST[tipo]);
    }
    if (caso.sopro) addMurmur(d, sr, base + caso.sopro.t0 * k, base + caso.sopro.t1 * k, caso.sopro.forma, {});
  }
  // normalização suave
  let mx = 0;
  for (let i = 0; i < d.length; i++) mx = Math.max(mx, Math.abs(d[i]));
  if (mx > 0) for (let i = 0; i < d.length; i++) d[i] = (d[i] / mx) * 0.9;
  return buf;
}

/** Toca um buffer uma vez ou em laço; devolve { stop, startedAt, duration }. */
export function playBuffer(buf, { loop = false } = {}) {
  const c = getContext();
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = loop;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
  src.connect(lp).connect(out());
  const startedAt = c.currentTime + 0.03;
  src.start(startedAt);
  return { src, startedAt, duration: buf.duration, stop: () => { try { src.stop(); } catch { /* já parado */ } } };
}

/** Batida curta para sincronizar com animações (laboratório do ciclo). */
export function thump(tipo = 'B1') {
  const sr = SR;
  const p = BURST[tipo] || BURST.B1;
  const buf = newBuffer(Math.ceil(sr * (p.dur + 0.02)));
  addBurst(buf.getChannelData(0), sr, 0.005, p);
  const d = buf.getChannelData(0);
  let mx = 0; for (const v of d) mx = Math.max(mx, Math.abs(v));
  for (let i = 0; i < d.length; i++) d[i] = (d[i] / (mx || 1)) * (tipo === 'B1' ? 0.9 : 0.75);
  playBuffer(buf);
}
