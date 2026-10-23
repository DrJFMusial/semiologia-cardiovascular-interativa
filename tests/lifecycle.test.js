import test from 'node:test';
import assert from 'node:assert/strict';

test('visibilidade parcial, transição de slide, exclusividade e suspensão da página', async () => {
  const events = {}, windowEvents = {};
  let notify;
  globalThis.document = { hidden: false, addEventListener: (name, cb) => events[name] = cb };
  globalThis.window = { addEventListener: (name, cb) => windowEvents[name] = cb };
  globalThis.IntersectionObserver = class {
    constructor(cb) { notify = cb; }
    observe() {}
  };
  const registry = await import('../src/core/registry.js');
  const counts = [{ on: 0, off: 0, pause: 0 }, { on: 0, off: 0, pause: 0 }];
  const nodes = counts.map((count, i) => ({
    dataset: { component: `test${i}` }, addEventListener() {},
    closest() { return this; },
  }));
  nodes.forEach((node, i) => registry.register(`test${i}`, () => ({
    activate() { counts[i].on++; }, deactivate() { counts[i].off++; }, pause() { counts[i].pause++; },
  })));
  registry.mountAll({ querySelectorAll: () => nodes });
  const entry = node => ({ target: node, isIntersecting: true, intersectionRatio: 0.05,
    intersectionRect: { width: 200, height: 20 } });
  notify(nodes.map(entry));
  assert.deepEqual(counts.map(c => c.on), [1, 1], '5% visível deve ativar simulador alto');
  notify(nodes.map(entry));
  assert.deepEqual(counts.map(c => c.on), [1, 1], 'não duplicar activate');
  events.click({ target: nodes[0] });
  assert.equal(counts[1].pause, 1);
  registry.onSlideChange({ contains: node => node === nodes[0] });
  const off = counts[1].off;
  notify([entry(nodes[1])]);
  assert.equal(counts[1].off, off, 'observador não reativa slide oculto');
  document.hidden = true;
  events.visibilitychange();
  assert.equal(counts[0].pause, 1);
  document.hidden = false;
  events.visibilitychange();
  assert.equal(counts[0].on, 2);
  windowEvents.pagehide();
  assert.equal(counts[0].pause, 2);
  windowEvents.pageshow();
  assert.equal(counts[0].on, 3, 'recupera observação após BFCache');
});

test('pausa global encerra fontes Web Audio e desconecta nós, inclusive loops', async () => {
  const sources = [], filters = [];
  window.AudioContext = class {
    state = 'running'; currentTime = 0; destination = {};
    createGain() { return { gain: { value: 0 }, connect() {} }; }
    createBufferSource() {
      const src = { stops: 0, disconnects: 0, connect: x => x, start() {},
        stop() { this.stops++; }, disconnect() { this.disconnects++; } };
      sources.push(src); return src;
    }
    createBiquadFilter() {
      const filter = { frequency: {}, connect() {}, disconnects: 0, disconnect() { this.disconnects++; } };
      filters.push(filter); return filter;
    }
  };
  const { playBuffer, stopAllAudio } = await import('../src/core/audio.js');
  const a = playBuffer({ duration: 1 }, { loop: true });
  playBuffer({ duration: 0.1 });
  stopAllAudio(); stopAllAudio(); a.stop();
  assert.deepEqual(sources.map(s => s.stops), [1, 1]);
  assert.deepEqual(filters.map(s => s.disconnects), [1, 1]);
  const ended = playBuffer({ duration: 1 });
  ended.src.onended();
  stopAllAudio();
  assert.equal(ended.src.stops, 0, 'fonte terminada sai do registro');
});
