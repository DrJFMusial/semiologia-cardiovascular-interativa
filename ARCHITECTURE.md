# Arquitetura — v0.2.1

Aplicação estática: módulos ES em JavaScript, Reveal.js 5.2.1, Vite 7.3.7 e vite-plugin-singlefile 2.3.4. Sem React, servidor de aplicação, banco ou telemetria. A atualização de Vite tem benefício de segurança comprovado pelo npm audit; a estrutura existente foi mantida.

- `src/main.js`: importa nove slides HTML, monta componentes e escolhe modo por URL/largura inicial.
- `core/registry.js`: fábricas por `data-component`; IntersectionObserver ativa/pausa componentes conforme visibilidade.
- `core/shell.js`: navegação, volume, pausa geral, movimento reduzido, notas e tela cheia.
- `cycle/model.js`: fases prescritas e interpolação monotônica de valores ilustrativos; estado instantâneo puro.
- `cycle/transport.js`: avanço bidirecional de 10 ms; 80 quadros por ciclo de 800 ms. Não equivale a resolução fisiológica de aquisição.
- `cycle/heart.js`, `plots.js`: SVG e animação via requestAnimationFrame. Mesma origem temporal; valvas visualmente suavizadas durante reprodução.
- `audio.js`: catálogo, síntese aleatória de ruído filtrado e Web Audio. Tempos determinísticos, forma acústica não determinística. AudioContext iniciado por interação.
- `quiz/answer.js`: avaliação pura das respostas; `escuta.js` mantém estado de rodada e feedback no componente.

Estado local em closures. Modos apresentação e estudo reutilizam conteúdo: Reveal no primeiro, documento rolável com adaptador no segundo. Navegação dos simuladores intercepta teclas para evitar troca do slide.

`npm ci`, `npm test`, `npm run build:all`. `dist/` tem URLs relativas (`base: './'`); `dist-offline/index.html` incorpora CSS, JavaScript e fontes. Node 22.12+ recomendado. Workflow Pages executa instalação, testes e build; sua execução remota não foi validada.

Acoplamentos a controlar: catálogo de áudio também concentra conteúdo; geradores misturam DOM e comportamento; quiz importa desenho da ausculta. Nenhuma refatoração ampla justificada nesta iteração. Sem suíte DOM dedicada, leitor de tela ou teste multibrowser ainda. Não expor o servidor de desenvolvimento como site público.
