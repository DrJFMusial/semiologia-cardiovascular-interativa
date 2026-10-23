# Arquitetura de manutenção

Aplicação estática em módulos JavaScript, Reveal.js 5.2.1 e Vite 7.3.7. `src/main.js` reúne 29 fragmentos HTML, resolve imagens e registra 18 tipos de componente (20 instâncias). Não há servidor de dados ou dependência remota em execução para o conteúdo principal.

- Apresentação: canvas lógico 1600 × 900 escalado pelo Reveal; `slidechanged` determina o único slide ativo.
- Estudo: documento fluido; IntersectionObserver ativa componentes parcialmente visíveis, independentemente da proporção da área total do componente. ResizeObserver informa a altura efetiva da barra.
- `src/core/registry.js`: montagem única, transições de ativação idempotentes, pausa global, visibilidade da página e exclusividade da interação entre componentes. Retornar à página não reinicia players que exigem gesto.
- `src/core/audio.js`: contexto sob interação, ganho mestre, síntese esquemática e limpeza das fontes ao parar/terminar. Nenhuma gravação clínica foi introduzida.
- Cada simulador mantém estado local e fornece `pause`/`deactivate` quando necessário. Os dados dos exercícios não persistem após recarga; a seleção é mantida durante navegação na mesma página, conforme o componente.
- `src/simulators/cycle/model.js`: fases prescritas e curvas qualitativas; não é um solver hemodinâmico. Testes determinísticos verificam fases, valvas, volumes e respostas, sem certificar fidelidade clínica do desenho.
- Build web em `dist/`, com base relativa; build offline em `dist-offline/index.html`, com scripts, CSS, fontes, imagens e ícone incorporados. Mesmos módulos educacionais nos dois alvos.
- CI de PR instala, testa e gera os dois alvos, disponibilizando artefato de prévia. O workflow de produção continua separado e depende de atualização de `main` ou execução manual autorizada.
