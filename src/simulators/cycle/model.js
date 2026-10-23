/**
 * Modelo esquemático do ciclo cardíaco (coração esquerdo em destaque).
 *
 * Base temporal: ciclo de 0,80 s (75 bpm), origem no início da sístole atrial.
 * Os valores seguem a forma qualitativa do diagrama de Wiggers e ordens de
 * grandeza fisiológicas de adulto em repouso (Porto & Porto, cap. 46-47;
 * Swartz, cap. 11). NÃO são medidas: servem para mostrar a ORDEM dos eventos,
 * a coerência entre valvas, pressões, volume, ECG e bulhas.
 *
 * Regra de coerência garantida por construção:
 *  - fases isovolumétricas: volume ventricular constante (keyframes iguais nas
 *    bordas + interpolação monotônica, sem overshoot);
 *  - valva mitral fechada de B1 até o fim do relaxamento isovolumétrico;
 *  - valva aórtica aberta somente durante a ejeção;
 *  - B1 = fechamento das AV (início da contração isovolumétrica);
 *  - B2 = fechamento das semilunares (início do relaxamento isovolumétrico),
 *    coincidindo com o fim da onda T.
 */

export const T = 0.8; // s

/** Fases mecânicas, contíguas, cobrindo [0, T). */
export const PHASES = [
  {
    id: 'atrial', n: 1, t0: 0.0, t1: 0.12, nome: 'Sístole atrial', curto: 'Sístole atrial',
    grupo: 'diastole',
    av: 'aberta', semi: 'fechada',
    resumo: 'Os átrios contraem e completam o enchimento ventricular.',
    detalhe:
      'Após a onda P, os átrios se contraem e empurram o último volume de sangue para os ventrículos ' +
      '(cerca de 20 % do enchimento em repouso). As valvas atrioventriculares estão abertas; as semilunares, fechadas. ' +
      'É o momento da quarta bulha (B4), quando ela existe.',
  },
  {
    id: 'ivc', n: 2, t0: 0.12, t1: 0.17, nome: 'Contração isovolumétrica', curto: 'Contração isovol.',
    grupo: 'sistole',
    av: 'fechada', semi: 'fechada',
    resumo: 'Todas as valvas fechadas: a pressão sobe, o volume não muda.',
    detalhe:
      'O ventrículo começa a contrair. Assim que sua pressão supera a do átrio, as valvas mitral e tricúspide fecham: é a primeira bulha (B1). ' +
      'Como as semilunares ainda estão fechadas, não há ejeção: a pressão ventricular sobe rapidamente com volume constante.',
  },
  {
    id: 'ejecao', n: 3, t0: 0.17, t1: 0.42, nome: 'Ejeção ventricular', curto: 'Ejeção',
    grupo: 'sistole',
    av: 'fechada', semi: 'aberta',
    resumo: 'Semilunares abertas: o sangue sai para a aorta e a artéria pulmonar.',
    detalhe:
      'Quando a pressão ventricular ultrapassa a da aorta (e a da artéria pulmonar, à direita), as valvas semilunares abrem. ' +
      'A ejeção é rápida no início e mais lenta no fim; o volume ventricular cai do volume diastólico final ao sistólico final. ' +
      'Durante a ejeção o átrio volta a se encher (as AV continuam fechadas).',
  },
  {
    id: 'ivr', n: 4, t0: 0.42, t1: 0.5, nome: 'Relaxamento isovolumétrico', curto: 'Relax. isovol.',
    grupo: 'diastole',
    av: 'fechada', semi: 'fechada',
    resumo: 'Todas as valvas fechadas: a pressão cai, o volume não muda.',
    detalhe:
      'O ventrículo relaxa e sua pressão fica abaixo da aórtica: as semilunares fecham, produzindo a segunda bulha (B2), ao fim da onda T. ' +
      'Enquanto a pressão ventricular ainda é maior que a atrial, as AV permanecem fechadas: a pressão despenca sem mudança de volume.',
  },
  {
    id: 'rapido', n: 5, t0: 0.5, t1: 0.63, nome: 'Enchimento ventricular rápido', curto: 'Enchimento rápido',
    grupo: 'diastole',
    av: 'aberta', semi: 'fechada',
    resumo: 'AV abertas: o sangue acumulado no átrio entra rapidamente no ventrículo.',
    detalhe:
      'Quando a pressão ventricular fica abaixo da atrial, as valvas mitral e tricúspide abrem e o ventrículo se enche depressa. ' +
      'Ao fim desta fase pode surgir a terceira bulha (B3): normal em crianças e jovens, a interpretar no contexto em adultos.',
  },
  {
    id: 'diastase', n: 6, t0: 0.63, t1: 0.8, nome: 'Diástase (enchimento lento)', curto: 'Diástase',
    grupo: 'diastole',
    av: 'aberta', semi: 'fechada',
    resumo: 'Pressões de átrio e ventrículo quase iguais: o enchimento fica lento.',
    detalhe:
      'Átrio e ventrículo funcionam quase como uma câmara única; o fluxo é pequeno. É a fase que mais encurta quando a frequência cardíaca aumenta. ' +
      'Termina com a nova onda P e a próxima sístole atrial.',
  },
];

/** Eventos pontuais (bulhas e marcos elétricos). */
export const EVENTS = {
  B1: 0.12, // fechamento AV
  B2: 0.42, // fechamento semilunar
  B3: 0.6, // fim do enchimento rápido (opcional)
  B4: 0.075, // contração atrial (opcional)
  aoOpen: 0.17,
  avOpen: 0.5,
};

/* ------------------------------------------------------------------------ */
/* Interpolação cúbica monotônica (Fritsch-Carlson): sem overshoot, de modo  */
/* que trechos com keyframes iguais permaneçam exatamente constantes.        */
/* ------------------------------------------------------------------------ */
function monotone(points) {
  const n = points.length;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

/* Keyframes [t (s), valor]. Início e fim iguais: curvas periódicas. */

// Volume ventricular esquerdo (mL): VDF 120, VSF 50 (fração de ejeção ~58 %).
const VOL = monotone([
  [0.0, 104], [0.06, 112], [0.12, 120], // sístole atrial
  [0.17, 120], // contração isovolumétrica: constante
  [0.22, 98], [0.29, 68], [0.36, 55], [0.42, 50], // ejeção rápida, depois lenta
  [0.5, 50], // relaxamento isovolumétrico: constante
  [0.54, 72], [0.6, 92], [0.63, 96], // enchimento rápido
  [0.7, 100], [0.8, 104], // diástase
]);

// Pressão ventricular esquerda (mmHg).
const PVE = monotone([
  [0.0, 5], [0.07, 9], [0.12, 10],
  [0.135, 24], [0.155, 56], [0.17, 80],
  [0.2, 104], [0.25, 120], [0.3, 117], [0.37, 106], [0.42, 92],
  [0.45, 52], [0.48, 18], [0.5, 7],
  [0.53, 3], [0.58, 4], [0.63, 4.5],
  [0.72, 5], [0.8, 5],
]);

// Pressão aórtica (mmHg).
const PAO = monotone([
  [0.0, 85], [0.12, 81], [0.17, 80],
  [0.2, 102], [0.25, 118], [0.3, 116], [0.37, 106], [0.42, 96],
  [0.435, 92], [0.455, 97], // incisura (dicrótica)
  [0.55, 94], [0.65, 91], [0.8, 85],
]);

// Pressão atrial esquerda (mmHg): ondas a, c, v e descenso y.
const PAE = monotone([
  [0.0, 6], [0.075, 10], [0.12, 7.5], // onda a
  [0.135, 9], [0.16, 6.5], // onda c
  [0.2, 4], [0.32, 7], [0.42, 10], [0.48, 12], // ascensão até a onda v
  [0.5, 11.5], [0.56, 6], [0.63, 5], // descenso y após abertura mitral
  [0.72, 5.5], [0.8, 6],
]);

// Volume atrial relativo (0-1), para animar o tamanho dos átrios.
const VAT = monotone([
  [0.0, 0.62], [0.12, 0.3], [0.17, 0.32], [0.42, 0.85], [0.5, 1.0],
  [0.6, 0.62], [0.8, 0.62],
]);

/** ECG esquemático (mV), periódico. P 0,72-0,80; QRS 0,06-0,12; T 0,30-0,42. */
function ecg(t) {
  const g = (mu, sd, a) => a * Math.exp(-0.5 * ((t - mu) / sd) ** 2);
  const gw = (mu, sd, a) => g(mu, sd, a) + g(mu - T, sd, a) + g(mu + T, sd, a);
  return (
    gw(0.765, 0.018, 0.15) + // P
    gw(0.075, 0.006, -0.12) + // Q
    gw(0.088, 0.008, 1.25) + // R
    gw(0.102, 0.007, -0.28) + // S
    gw(0.37, 0.032, 0.32) // T (termina ~0,42)
  );
}

/** Fonocardiograma esquemático: envelope de B1 e B2 (B3/B4 opcionais). */
export function phono(t, { b3 = false, b4 = false } = {}) {
  const burst = (t0, dur, amp, f) => {
    const x = t - t0;
    if (x < 0 || x > dur) return 0;
    const env = Math.sin((Math.PI * x) / dur) ** 2;
    return amp * env * Math.sin(2 * Math.PI * f * x);
  };
  let y = burst(EVENTS.B1, 0.07, 1.0, 55) + burst(EVENTS.B2, 0.05, 0.85, 75);
  if (b3) y += burst(EVENTS.B3, 0.045, 0.45, 32);
  if (b4) y += burst(EVENTS.B4, 0.045, 0.4, 32);
  return y;
}

export const series = {
  vol: VOL, pve: PVE, pao: PAO, pae: PAE, vat: VAT, ecg,
};

export function phaseAt(t) {
  const x = ((t % T) + T) % T;
  return PHASES.find((p) => x >= p.t0 && x < p.t1) || PHASES[PHASES.length - 1];
}

/** Estado instantâneo coerente. */
export function stateAt(t) {
  const x = ((t % T) + T) % T;
  const ph = phaseAt(x);
  const vol = VOL(x);
  const dv = (VOL(Math.min(x + 0.004, T)) - VOL(Math.max(x - 0.004, 0))) / 0.008; // mL/s
  return {
    t: x, phase: ph,
    vol, dv,
    pve: PVE(x), pao: PAO(x), pae: PAE(x), vat: VAT(x),
    ecg: ecg(x),
    avOpen: ph.av === 'aberta',
    semiOpen: ph.semi === 'aberta',
    atrialContracting: x < 0.12,
    ventContracting: x >= 0.12 && x < 0.42,
  };
}

/** Verificação de coerência (usada nos testes e no console em modo dev). */
export function selfCheck() {
  const erros = [];
  for (let t = 0; t < T; t += 0.001) {
    const s = stateAt(t);
    const iso = s.phase.id === 'ivc' || s.phase.id === 'ivr';
    const borda = Math.min(t - s.phase.t0, s.phase.t1 - t) < 0.005;
    if (iso && !borda && Math.abs(s.dv) > 1) erros.push(`volume varia em fase isovolumétrica em t=${t.toFixed(3)}`);
    if (s.semiOpen && s.pve + 1 < s.pao - 6) erros.push(`ejeção com PVE << PAo em t=${t.toFixed(3)}`);
    if (s.phase.id === 'ivc' && s.pve < s.pae - 1 && t > 0.125) erros.push(`AV fechada com PVE<PAE em t=${t.toFixed(3)}`);
  }
  return erros;
}
