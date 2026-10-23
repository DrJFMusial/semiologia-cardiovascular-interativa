# Relatório de QA: versão 1.0.0

Testes automatizados com Playwright e Chromium (motor do Chrome e do Edge), em 23/10/2026. Scripts em `sandbox/`.

## Versão final (29 telas)

| Verificação | Resultado |
|---|---|
| Todas as telas em 1920 × 1080 e 1366 × 768 | zero erros no console; nenhum elemento ultrapassa a borda inferior do quadro (verificação automática por tela) |
| Modo estudo em 390 × 844 | sem rolagem horizontal em nenhuma seção |
| Korotkoff: inflar, abrir válvula, desinsuflar | batimentos registrados nas fases certas; exercício com leitura 120 × 80 para caso 108 × 70 gerou feedback de erro, de desinsuflação rápida, de arredondamento e a classificação |
| Korotkoff e PVJ com setas | setas atuam no simulador; o slide não muda |
| ECG, sintomas, pulsos, inspeção, sincronia, sons do ritmo, descritor de sopro, edema, registro, checklist | interações executadas sem erro; descritor gerou "Sopro protodiastólico em foco aórtico, grau IV/VI, com frêmito…" |
| Checklist | marcar caixas não troca de slide; contagem correta |
| Arquivo offline por `file://` | 7 ilustrações carregadas (data URI); fontes carregadas; nenhuma requisição externa |
| Site em subdiretório | 29 telas, nenhuma requisição externa |
| Desempenho com o ciclo em reprodução | 60 fps |
| Tempo previsto (notas do apresentador) | 50 min; 48 sem a tela de ritmo |

## Protótipo (fase 2)

## Resultados

| Verificação | Método | Resultado |
|---|---|---|
| Full HD 1920 × 1080, 9 telas | captura de cada slide | sem corte nem sobreposição; zero erros no console |
| 1366 × 768, 9 telas | idem | sem corte; barra de controles some após 2,6 s sem mouse para não cobrir o simulador |
| 1600 × 900 (resolução nativa do quadro) | testes de interação | ok |
| Modo estudo 1280 × 800 | página inteira | ok |
| Celular 390 × 844 (modo estudo) | página inteira | sem rolagem horizontal da página; traçados do ciclo rolam lateralmente dentro do próprio quadro |
| Setas dentro do simulador | duas setas com o laboratório em foco | fase avançou de 1 para 3; slide permaneceu o 5 |
| Espaço no simulador | reproduzir | animação iniciou |
| Troca de slide durante animação | sair do slide 5 | animação pausada automaticamente |
| Anatomia | percurso passo a passo, filtro "Valvas", Tab entre estruturas | ficha correta; ordem de Tab sem repetição |
| Focos, modo exercício | clique fora do alvo | feedback descreve o ponto marcado e o local correto |
| Ausculta | sopro sistólico, "Comparar com o normal", reproduzir | forma de onda com 2 ciclos normais + 2 do caso; cursor sincronizado |
| Atividade de escuta | ouvir e responder | feedback e forma de onda revelada após a resposta |
| Menu de seções (M) | abrir pelo teclado | agrupado por seção, foco no slide atual |
| Áudio sem gesto | carga das páginas | nenhum som e nenhum aviso de autoplay; o contexto de áudio só nasce no clique |
| Build `dist/` servido em subdiretório | `/semiologia/` em servidor estático | ok; nenhuma requisição externa |
| Build offline por `file://` | duplo clique simulado | ok; fontes carregadas; nenhuma requisição além do próprio arquivo |
| Desempenho | quadros por segundo com o ciclo em reprodução, 1920 × 1080 | 60 fps (antes da otimização: 29 fps; removido o filtro de sombra recalculado a cada quadro) |
| Peso | build | JS 251 kB (77 kB gzip); CSS 84 kB; arquivo offline 440 kB |
| Coerência do modelo | `selfCheck()` no modo de desenvolvimento | nenhuma incoerência (volume constante nas fases isovolumétricas, valvas coerentes com as pressões) |

## Corrigido durante o QA

Gradientes do coração sumiam quando o outro slide com coração estava oculto (ids duplicados): ids passaram a ser únicos por instância. Figuras da anatomia e do tórax extrapolavam a área útil: dimensionamento absoluto dentro do contêiner. Rótulos sobrepostos no coração (artéria pulmonar, veias pulmonares) e nos traçados (volume, marcos valvares, nome da fase 4): reposicionados. Concordância de gênero no feedback dos focos. Números dos espaços intercostais movidos para a borda esternal, onde a contagem é feita. Atalho de pausa geral mudou de P para X, porque P é "slide anterior" no reveal.js. Transbordo horizontal do laboratório no celular.

## Não testado nesta fase

Firefox (motor não disponível no ambiente de teste), saída real de áudio em alto-falante e projetor, toque em aparelhos físicos, leitores de tela, contraste no projetor da sala. Recomendado conferir na sala antes do uso: Chrome ou Edge, tela cheia (F), volume do sistema.

## Limitações conhecidas

No celular, os círculos dos focos ficam pequenos para toque; a lista lateral dá acesso equivalente. Os traçados do ciclo exigem rolagem lateral em telas abaixo de 760 px.
