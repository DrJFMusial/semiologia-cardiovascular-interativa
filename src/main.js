/**
 * Semiologia Cardiovascular Interativa | E2M08 2026/2
 * Ponto de entrada: monta os slides, inicializa o Reveal no modo escolhido
 * (apresentação ou estudo) e registra os componentes interativos.
 */
import Reveal from 'reveal.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import 'reveal.js/dist/reveal.css';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slides.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/heart.css';
import './styles/theme.css';

import { register, mountAll } from './core/registry.js';
import { buildShell } from './core/shell.js';
import { cycleLab } from './simulators/cycle/index.js';
import { anatomy } from './simulators/anatomy/index.js';
import { focos } from './simulators/focos/index.js';
import { ausculta } from './simulators/ausculta/index.js';
import { escuta } from './simulators/quiz/escuta.js';
import { roteiro } from './components/roteiro.js';
import { revelar, hotspots, somchip, checklist } from './components/generic.js';
import { registro } from './components/registro.js';
import { korotkoffSim } from './simulators/korotkoff/index.js';
import { pvj } from './simulators/pvj/index.js';
import { ecg } from './simulators/ecg/index.js';
import { pulsos } from './simulators/pulsos/index.js';
import { sopro } from './simulators/sopro/index.js';
import { edema } from './simulators/edema/index.js';
import { sincronia } from './simulators/sincronia/index.js';
import { selfCheck } from './simulators/cycle/model.js';

// ---- conteúdo: um arquivo HTML por slide, em ordem alfabética ----------------
const files = import.meta.glob('./slides/*.html', { query: '?raw', import: 'default', eager: true });
// imagens: os slides citam "@img/nome.webp"; o Vite resolve o endereço final
// (arquivo com hash no site, data URI no pacote offline)
const imgs = import.meta.glob('./assets/images/*.webp', { query: '?url', import: 'default', eager: true });
const imgUrl = Object.fromEntries(Object.entries(imgs).map(([k, v]) => [k.split('/').pop(), v]));
const html = Object.keys(files).sort().map((k) => files[k]).join('\n')
  .replace(/@img\/([\w.-]+)/g, (m, n) => imgUrl[n] || m);
document.querySelector('.reveal .slides').innerHTML = html;

// ---- modo ------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const estreito = window.matchMedia('(max-width: 820px)').matches;
const modo = params.get('modo') || (estreito ? 'estudo' : 'apresentacao');
document.body.classList.add(modo === 'estudo' ? 'modo-estudo' : 'modo-apresentacao');
try {
  if (localStorage.getItem('reduce-motion') === '1') document.documentElement.classList.add('reduce-motion');
} catch { /* armazenamento indisponível: segue sem preferência salva */ }

// ---- componentes ------------------------------------------------------------------
register('cycle-lab', cycleLab);
register('anatomy', anatomy);
register('focos', focos);
register('ausculta', ausculta);
register('escuta', escuta);
register('roteiro', roteiro);
register('revelar', revelar);
register('hotspots', hotspots);
register('somchip', somchip);
register('checklist', checklist);
register('registro', registro);
register('korotkoff', korotkoffSim);
register('pvj', pvj);
register('ecg', ecg);
register('pulsos', pulsos);
register('sopro', sopro);
register('edema', edema);
register('sincronia', sincronia);

/* Modo apresentação: Reveal com tela fixa de 1600 × 900 escalada sem corte.
   Modo estudo: documento rolável e responsivo (sem escala), para leitura no
   celular; a barra usa o mesmo contrato mínimo do Reveal (adaptador abaixo). */
let deck;
if (modo === 'estudo') {
  deck = studyDeck();
  mountAll(document);
  buildShell(deck, { modo });
} else {
  deck = new Reveal(document.querySelector('.reveal'), {
    width: 1600,
    height: 900,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.5,
    hash: true,
    history: false,
    controls: true,
    controlsLayout: 'bottom-right',
    progress: true,
    slideNumber: 'c/t',
    center: false,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    plugins: [Notes],
  });
  deck.initialize().then(() => {
    mountAll(document);
    buildShell(deck, { modo });
  });
}
if (import.meta.env.DEV) {
  const e = selfCheck();
  console.info(e.length ? `Modelo do ciclo: ${e.length} incoerências` : 'Modelo do ciclo: coerência verificada');
}

function studyDeck() {
  const slides = [...document.querySelectorAll('.reveal .slides > section')];
  slides.forEach((s, i) => { s.id = s.id || `s${i + 1}`; });
  const go = (i) => slides[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const m = /^#\/?(\d+)/.exec(location.hash);
  if (m) requestAnimationFrame(() => go(Number(m[1])));
  return {
    getSlides: () => slides,
    slide: go,
    getIndices: () => {
      let h = 0;
      slides.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) h = i; });
      return { h, v: 0 };
    },
    getPlugin: () => null,
  };
}

window.__deck = deck;
