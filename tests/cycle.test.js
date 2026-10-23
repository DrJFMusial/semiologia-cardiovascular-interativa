import test from 'node:test';
import assert from 'node:assert/strict';
import { T, PHASES, EVENTS, stateAt, phaseAt, selfCheck } from '../src/simulators/cycle/model.js';
import { advanceFrame } from '../src/simulators/cycle/transport.js';
import { CASOS } from '../src/core/audio.js';
import { evaluateAnswer } from '../src/simulators/quiz/answer.js';

test('respostas dos seis casos: 36 combinações, rejeita identificadores inválidos', () => {
  for (const a of Object.keys(CASOS)) for (const b of Object.keys(CASOS)) {
    assert.deepEqual(evaluateAnswer(a, b), { correct: a === b, expected: a, selected: b });
  }
  assert.throws(() => evaluateAnswer('normal', 'inexistente'), RangeError);
});

test('fases cobrem o ciclo e limites exatos pertencem à fase nova', () => {
  assert.equal(PHASES[0].t0, 0);
  assert.equal(PHASES.at(-1).t1, T);
  for (const [i, p] of PHASES.entries()) {
    assert.equal(phaseAt(p.t0).id, p.id);
    assert.equal(stateAt(p.t0).phase.id, p.id);
    assert.equal(phaseAt(p.t0 + T).id, p.id);
    if (i) assert.equal(PHASES[i - 1].t1, p.t0);
  }
});
test('isovolumetria: volume constante, fluxo zero e todas as valvas fechadas, incluindo início', () => {
  for (const id of ['ivc', 'ivr']) {
    const p = PHASES.find(x => x.id === id);
    const expectedVolume = id === 'ivc' ? 120 : 50;
    for (let i = 0; i < 100; i++) {
      const s = stateAt(p.t0 + (p.t1 - p.t0) * i / 100);
      assert.equal(s.phase.id, id);
      assert.ok(Math.abs(s.vol - expectedVolume) < 1e-10);
      assert.equal(s.dv, 0);
      assert.equal(s.avOpen, false);
      assert.equal(s.semiOpen, false);
    }
  }
});
test('ejeção perde volume; enchimento ganha volume; valvas não abrem juntas', () => {
  for (let i = 0; i < 8000; i++) {
    const s = stateAt(i / 10000);
    assert.ok(!(s.avOpen && s.semiOpen));
    assert.ok(s.vol >= 50 - 1e-10 && s.vol <= 120 + 1e-10);
    if (s.phase.id === 'ejecao') assert.ok(s.dv <= 1e-7);
    if (s.avOpen) assert.ok(s.dv >= -1e-7);
  }
  assert.deepEqual(selfCheck(), []);
});
test('B1 e B2 iniciam fases isovolumétricas', () => {
  assert.equal(stateAt(EVENTS.B1).phase.id, 'ivc');
  assert.equal(stateAt(EVENTS.B2).phase.id, 'ivr');
});
test('quadros de 10 ms: ida, volta, repetição e passagem pelo fim do ciclo', () => {
  assert.equal(advanceFrame(0, -1), 0.79);
  assert.equal(advanceFrame(0.79), 0);
  assert.equal(advanceFrame(0.41), 0.42);
  assert.equal(stateAt(advanceFrame(0.41)).phase.id, 'ivr');
  let t = 0;
  for (let i = 0; i < 80; i++) t = advanceFrame(t);
  assert.equal(t, 0);
  assert.equal(advanceFrame(advanceFrame(0.42), -1), 0.42);
  assert.throws(() => stateAt(NaN), TypeError);
});
test('catálogo auditivo: eventos extras e sopros na fase correta; B4 não rotulada fisiológica habitual', () => {
  assert.ok(CASOS.b3.eventos.find(x => x.tipo === 'B3').t > EVENTS.B2);
  assert.ok(CASOS.b4.eventos.find(x => x.tipo === 'B4').t < EVENTS.B1);
  assert.ok(CASOS.sistolico.sopro.t0 > EVENTS.B1 && CASOS.sistolico.sopro.t1 < EVENTS.B2);
  assert.ok(CASOS.diastolico.sopro.t0 > EVENTS.B2);
  assert.match(CASOS.b4.descricao, /Não é achado fisiológico habitual/);
});
