# Auditoria de manutenção — candidata 1.1.1

23/10/2026 · E2M08 · Prof. João Frederico Musial · Centro Universitário Campo Real.

## Estado inicial e preservação

Repositório oficial `DrJFMusial/semiologia-cardiovascular-interativa`, produção 1.1.0 no commit `0d518af0eb88188d63bc7d719197185cd04bdc4b`; workflow de produção bem-sucedido nº 39904182425. Checkout inicialmente limpo e nenhum PR aberto. Referências preservadas: branch remota `backup/stable-v1.1.0`, branch local `stable/v1.1.0`, bundle local `auditoria-v1.1.1/stable-v1.1.0.bundle` e cópia da compilação original. Trabalho isolado em `maintenance/audit-v1.1.1`; sem merge ou publicação.

Conferência HTTP: 17 arquivos publicados, incluindo sete imagens, retornaram 200 e coincidiram byte a byte com a compilação preservada. Uma primeira comparação contra a compilação já modificada divergiu, como esperado; a comparação correta foi repetida contra a referência estável. Não se usou o build como prova única de funcionamento.

## Achados e correções

| Gravidade | Causa / efeito | Correção e verificação |
|---|---|---|
| Alta | IntersectionObserver exigia mais de 25% da área do componente; simuladores altos não atingiam o limiar em janelas baixas. | Ativação por interseção positiva; reprodução/pausa/quadro testados em 844×390; teste de regressão com 5% visível. |
| Alta | Mudança do Reveal não conectada ao registro; não havia pausa central ao ocultar a página e podia haver áudio concorrente no estudo. | `slidechanged`, visibilidade, pagehide/pageshow, transições idempotentes, pausa de outros componentes na interação e parada das fontes. Navegação testada em dev/produção e ciclo de vida coberto com mocks. |
| Alta | Grades mínimas e controles sem quebra causavam cortes internos, mesmo sem rolagem horizontal da página. | Grades de estudo adaptadas, textos/controles com quebra e mínimos corrigidos. Zero extravasamentos de seção na matriz móvel posterior. |
| Alta | Media queries de conteúdo também reorganizavam a apresentação fixa quando a viewport encolhia. | Regras de conteúdo limitadas ao estudo; apresentação mantém canvas escalado. 29 telas medidas também em 854×480, aproximação de menor área útil/zoom, sem simular zoom real do navegador. |
| Alta | Teclas em controles podiam chegar ao Reveal; exercício de focos exigia apontar no desenho. | Proteção de eventos dos controles e alternativas de localização anatômica usando o mesmo avaliador. Cinco rodadas por teclado executadas. |
| Moderada | Barra com altura fixa presumida e controles extensos na horizontal. | Barra compacta, quebra permitida, safe-area e altura medida; espaço e destinos de rolagem acompanham a altura. Altura em 844×390 caiu de aproximadamente 62 para 45–49 px, conforme estado de estilo. |
| Moderada | Trocar o grau do edema no meio da animação misturava parâmetros antigos e rótulo novo. | Cancela e reinicia a demonstração ao selecionar outro grau. |
| Moderada | Busca pausada no ciclo mantinha suavização de valvas; velocidade reduzida não atualizava seleção anunciada. | Reset gráfico na busca/Home e sincronização dos indicadores de velocidade; ativar redução de movimento pausa a execução corrente. |
| Moderada | Recriação das opções de sopro e fechamento do menu perdiam o foco. | Foco restaurado; menu contém Tab e fecha com Escape. Teste no Chrome confirmou retorno ao botão de seções. |
| Moderada | Destino inicial do estudo calculado antes de imagens/fontes; mudança de modo usava hash antigo. | Aguarda recursos antes da rolagem inicial e usa a seção atual para mudar de modo. Testado também no HTML offline. |
| Baixa | Manômetro parado reescrevia SVG/texto a cada quadro; fontes de áudio terminadas mantinham conexões. | Redesenho do manômetro apenas enquanto a pressão muda; desconexão e remoção das fontes ao terminar/parar. Sem benchmark de CPU/memória. |
| Baixa | HTML offline referenciava favicon externo e copiava arquivos públicos dispensáveis. | Ícone incorporado e saída offline de um HTML; verificador estrutural e teste de imagens sob demanda. |

Nenhum defeito crítico impeditivo foi confirmado no escopo executado. Isso não equivale a certificar ausência de defeitos em todas as combinações/dispositivos.

## Cobertura funcional

29 telas percorridas em apresentação, com capturas e inspeção de composição; 18 tipos de componente, 20 instâncias examinadas no código e exercitadas no navegador. A primeira passagem registrou 113 acionamentos de botões com rótulos, seguida de controles condicionais, pontos anatômicos, campos e exercícios. Não é teste exaustivo de todas as combinações de parâmetros.

| Componente | Interações / evidência |
|---|---|
| Roteiro e sintomas | Quatro etapas e cinco sintomas por Enter; revelar/ocultar. |
| Anatomia | Quatro filtros, percurso automático e avanço manual. Tentativa de `press` direto em um path SVG não foi executável pela ferramenta; navegação integral por Tab nos pontos SVG permanece pendente. |
| Ciclo cardíaco | Transporte, reinício, fases, quatro velocidades, camadas, sons e quadros de 10 ms; pausa ao navegar. Invariantes determinísticos amostrados em testes. |
| ECG | Cinco destaques; controle RR levado aos extremos por teclado, saída de 43 bpm conferida para sete quadrados. |
| Korotkoff | Explorar/exercício, quatro casos, valor, insuflar/esvaziar, válvula e duas velocidades. Deflação completa a 5 mmHg/s registrou eventos nas fases I–IV e terminou com manguito vazio. Em teste de exclusividade, outra interação fechou a válvula. Não houve aferição real nem validação de timbre clínico. |
| Pulsos / PVJ | 14 pontos de pulso acionados por Enter; três pacientes e quatro inclinações PVJ; extremos da régua por teclado. |
| Inspeção / posições | Oito marcadores e oito itens correspondentes acionados. |
| Focos | Explorar/exercício, linhas/EIC e cinco respostas por localização, feedback e resultado. |
| Sincronia / sons | Reprodução, comparação radial, seis casos sonoros com início/parada, repetição, comparação com normal, andamento lento, volume/mudo e pausa global. Eventos/UI e síntese verificados; qualidade acústica por alto-falantes/fones não foi medida. |
| Exercício auditivo | Cinco rodadas com feedback e reinício; 36 combinações de respostas cobertas pelo teste determinístico. |
| Sopros / registro | Opções de descrição, presets e registro final; graus do edema e pressão do polegar. |
| Checklist | 17 seleções, contagem 17/17 e limpeza para 0/17. |

Tentativas de clique em casos ocultos após entrar no exercício de PA tiveram timeout na primeira passagem; eram controles intencionalmente ocultos, não falhas do simulador. Foram reexecutados no modo Explorar. Erros da ferramenta ao focar um diálogo não focável foram resolvidos enviando Escape ao botão focado. Os registros brutos preservam essas tentativas.

## Ambientes e resoluções realmente usados

- Windows, navegador integrado Chromium: revisão principal; dev Vite e compilação web via HTTP local. Apresentação: 1920×1080, 2560×1440, 1366×768, 1280×720 e 854×480, 29 telas em cada dimensão, medição geométrica dos estados iniciais.
- Estudo, viewports emulados: 320×568, 390×844, 844×390, 667×375, 768×1024 e 1024×768. Rotações simuladas por redimensionamento; não houve aparelho físico ou emulação completa de sistema operacional/toque.
- Chrome desktop conectado: tema por Enter sem avançar slide, menu/Escape/foco, ciclo com áudio e pausa ao avançar; notas do apresentador abertas com slide atual, próximo e texto de notas. Botão de tela cheia acionado, mas não foi possível confirmar estado de tela cheia pela ferramenta; validação manual permanece pendente.
- Tema claro revisado nas 29 capturas; tema escuro inspecionado no ciclo, controles de PA e navegação. Não houve medição automatizada de contraste de cada elemento nem teste com leitor de tela.
- Offline: verificação estrutural mais execução do HTML autocontido servido por HTTP, 29 telas montadas, sete imagens data URI carregadas ao visitá-las, ciclo e troca de modo testados. Abertura por `file://` não foi testada nesta rodada. Notas do Reveal em popup podem depender das permissões/origem do navegador.
- Edge/Firefox/Safari, Android/iPhone/tablet reais, zoom nativo, áreas seguras físicas, suspensão real do sistema e projetor físico: não testados. Testes de visibilidade/BFCache são automatizados com mocks, sem alegar teste físico dessas condições.

Sem erros/warnings registrados nos consoles consultados durante as sequências locais de teste. Essa observação não garante ausência de erros em sequências não executadas.

## Ciência, pedagogia e desempenho

Nenhum conceito médico ou parâmetro fisiológico foi alterado. Isovolumetria, estados valvares, volume e cronologia B1/B2 continuam testados; ECG, pressões, fluxo de partículas e PVJ permanecem modelos esquemáticos. O estado visual do edema e das valvas foi corrigido para acompanhar a seleção. B4 não é ensinada como achado fisiológico habitual em crianças/jovens. Todos os sons são sintéticos e explicitamente rotulados.

A revisão preserva a distinção entre focos e projeção valvar, a lateralidade do paciente, a segurança de uma carótida por vez e as limitações da percussão. A classificação da PA foi confrontada com a diretriz brasileira de 2025. A relação gradiente/fluxo no fim da ejeção admite inércia; não foi aplicada uma falsa regra de pressão ventricular sempre maior durante toda a ejeção. Fontes, simplificações e pendências estão em [SCIENTIFIC_VALIDATION.md](../SCIENTIFIC_VALIDATION.md). Esta auditoria não substitui revisão docente integral.

Modo apresentação preserva composição e notas; estudo ganha controles utilizáveis e explicações existentes. Nenhum novo simulador extenso ou biblioteca foi incluído. Progresso dos exercícios não persiste após recarga.

Pacote web: 1.760.465 → 1.766.186 bytes (+5.721, aproximadamente 0,33%); JS 329.058 → 331.906, CSS 109.923 → 112.796 bytes. Offline: 2.191.915 bytes, um HTML. Imagens e fontes mantidas. Não foram medidos tempo em rede móvel, heap, CPU, FPS ou desempenho em celular intermediário; não se afirma ganho quantitativo de desempenho.

## Testes e entrega

Instalação limpa `npm ci` em diretório isolado concluída (16 pacotes). Onze testes Node passaram; build web, build offline e `node scripts/check-build.mjs` passaram. Nova CI de PR executa esses passos e publica apenas artefatos de revisão, sem deploy. A candidata 1.1.1 é compatível com o escopo de manutenção.

Evidências locais em `auditoria-v1.1.1/evidencias/`: medições JSON, 29 capturas, folhas de contato, controles e prévia horizontal. O ZIP de revisão reúne fonte e builds; os arquivos originais e o bundle estável foram preservados. PR da branch de manutenção preparado para revisão; merge e publicação dependem de autorização. Próximos passos em [ROADMAP.md](../ROADMAP.md).
