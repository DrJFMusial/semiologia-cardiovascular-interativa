/**
 * Registro de componentes interativos.
 * Cada elemento com data-component="nome" recebe a instância criada pela
 * fábrica correspondente. As instâncias podem expor:
 *   activate()   slide ficou visível
 *   deactivate() slide saiu de cena (pausar animações, parar áudio)
 *   pause()      pausa global solicitada pela barra
 */
import { stopAllAudio } from './audio.js';
const factories = new Map();
const instances = [];
let currentSlide = null;
let presentation = false;
let owner = null;

function setActive(entry, active) {
  if (entry.active === active) return;
  entry.active = active;
  if (active) entry.inst.activate?.();
  else entry.inst.deactivate?.();
}

function refresh(entry) {
  setActive(entry, !document.hidden && (presentation
    ? !!currentSlide?.contains(entry.node) : entry.visible));
}

export function register(name, factory) { factories.set(name, factory); }

export function mountAll(root = document) {
  root.querySelectorAll('[data-component]').forEach((node) => {
    if (node.__mounted) return;
    const f = factories.get(node.dataset.component);
    if (!f) { console.warn('Componente não registrado:', node.dataset.component); return; }
    const inst = f(node, { ...node.dataset }) || {};
    node.addEventListener('keydown', event => {
      if (event.target.closest?.('button, input, select, textarea, [role="button"], [role="radio"]')) event.stopPropagation();
    });
    node.__mounted = inst;
    const entry = { node, inst, active: undefined, visible: false };
    instances.push(entry);
    refresh(entry);
    io.observe(node);
  });
}

/* Ativação por visibilidade real: funciona no modo apresentação (um slide
   visível) e no modo estudo (rolagem contínua). */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const entry = instances.find(x => x.node === e.target);
    if (!entry) continue;
    // Um simulador alto pode ocupar menos de 25% da sua própria área na tela.
    entry.visible = e.isIntersecting && e.intersectionRect.height > 0 && e.intersectionRect.width > 0;
    refresh(entry);
  }
}, { threshold: [0] });

export function onSlideChange(current) {
  presentation = true;
  currentSlide = current;
  instances.forEach(refresh);
}

export function pauseAll() {
  instances.forEach(({ inst }) => inst.pause?.());
  stopAllAudio();
}

// Um único componente conduz a reprodução, inclusive no documento de estudo.
function claimInteraction(event) {
  const node = event.target.closest?.('[data-component]');
  if (!node || node === owner) return;
  instances.forEach(entry => { if (entry.node !== node) entry.inst.pause?.(); });
  stopAllAudio();
  owner = node;
}
document.addEventListener('click', claimInteraction, true);
document.addEventListener('keydown', claimInteraction, true);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseAll();
  instances.forEach(refresh);
});
window.addEventListener('pagehide', () => {
  pauseAll();
  instances.forEach(entry => setActive(entry, false));
});
window.addEventListener('pageshow', () => instances.forEach(refresh));
