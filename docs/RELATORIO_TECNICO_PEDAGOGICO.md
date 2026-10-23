# Relatório técnico-pedagógico: versão final 1.0.0

Semiologia Cardiovascular Interativa · E2M08 · 2026/2 · Prof. João Frederico Musial
Data: 23/10/2026

## 1. Síntese

A aula está completa: 29 telas, cerca de 50 minutos, com doze componentes interativos sobre o mesmo núcleo do protótipo aprovado. Todo o conteúdo dos 33 slides do deck v3 foi incorporado (seção 3), com as revisões científicas já feitas preservadas. Funciona em modo apresentação (16:9) e em modo estudo (rolagem, celular), no site estático para o GitHub Pages e em arquivo único offline. Nada foi publicado.

## 2. Sequência final e tempo

| # | Tela | Seção | Tipo | Tempo |
|---|---|---|---|---|
| 1 | Capa | Abertura | ECG animado com B1 e B2 | 1 |
| 2 | Roteiro do exame | Abertura | revelação das quatro técnicas | 2 |
| 3 | Caso condutor | Abertura | texto | 2 |
| 4 | Anatomia funcional | Bases | coração explorável, percurso do sangue | 2 |
| 5 | Laboratório do ciclo cardíaco | Bases | simulador | 4 |
| 6 | ECG normal | Bases | papel milimetrado, intervalos, régua de FC | 1 |
| 7 | Os cinco sintomas | Anamnese | revelação por sintoma | 2 |
| 8 | Esforço, dor e risco | Anamnese | texto | 1 |
| 9 | Preparação e sequência | Exame: preparo e PA | texto | 1 |
| 10 | Pressão arterial: técnica | Exame: preparo e PA | ilustração N2 + passos | 2 |
| 11 | Sons de Korotkoff | Exame: preparo e PA | simulador com exercício | 4 |
| 12 | Pulsos arteriais | Pulsos e pescoço | mapa clicável | 2 |
| 13 | Carótidas e aorta | Pulsos e pescoço | ilustração N4 | 1 |
| 14 | Jugulares e PVJ | Pulsos e pescoço | modelo com cabeceira ajustável | 2 |
| 15 | Inspeção | Precórdio | imagem 05 com pontos numerados | 1 |
| 16 | Percussão | Precórdio | imagem 03 | 1 |
| 17 | Palpação e ictus | Precórdio | ilustrações N6a e N6b | 2 |
| 18 | Focos de ausculta | Ausculta | tórax vetorial com exercício | 2 |
| 19 | Estetoscópio e sincronização | Ausculta | pulso carotídeo e bulhas com som | 2 |
| 20 | Posições de ausculta | Ausculta | imagem 04 com pontos numerados | 1 |
| 21 | Bulhas e sopros | Ausculta | seis sons sincronizados | 3 |
| 22 | Ritmo e desdobramento | Ausculta | diagrama e sons | 2* |
| 23 | Escute e identifique | Ausculta | atividade com feedback | 2 |
| 24 | Como descrever um sopro | Ausculta | descritor com sete características | 2 |
| 25 | Edema | Periferia e registro | cacifo por grau | 1 |
| 26 | Registro no prontuário | Periferia e registro | construtor do normal ao alterado | 2 |
| 27 | Checklist da estação | Fechamento | caixas de seleção, sem armazenamento | 1 |
| 28 | Para levar | Fechamento | texto | 1 |
| 29 | Referências | Fechamento | texto | 0 |

Total: 50 min. *A tela 22 pode ficar para o estudo se o tempo apertar (48 min); a nota do apresentador indica isso. Cada tela traz o tempo previsto nas notas.

## 3. Destino dos 33 slides originais

| Original | Tela final |
|---|---|
| 1 Capa · 2 Objetivos · 3 Caso | 1 · 2 (roteiro) · 3 |
| 4 Anatomia · 5 Ciclo · 6 ECG | 4 · 5 · 6 |
| 7 Referências do tórax | 18 (linhas, ângulo esternal, numeração dos EIC) |
| 8 Sintomas · 9 Risco · 10 Sequência | 7 · 8 · 9 |
| 11 PA técnica · 12 Korotkoff | 10 · 11 |
| 13 Pulsos · 14 Carótidas · 15 Jugulares | 12 · 13 · 14 |
| 16 Inspeção · 17 Percussão · 18 Palpação · 19 Ictus | 15 · 16 · 17 (18 e 19 fundidos) |
| 20 Focos · 21 Estetoscópio · 22 Posições | 18 · 19 · 20 |
| 23 B1 e B2 · 25 B3 e B4 · 26 Sopros | 21 (e camada B3/B4 do laboratório) |
| 24 Ritmo e desdobramento | 22 |
| 27 Descrever sopro | 24 |
| 28 Edema | 25 |
| 29 Registro normal · 30 Registro do caso | 26 (construtor com os dois) |
| 31 Checklist · 32 Para levar · 33 Referências | 27 · 28 · 29 |

## 4. Simuladores acrescentados na versão final

**ECG.** Papel a 25 mm/s e 10 mm/mV; destaque de P, PR, QRS, T e RR com a medida em quadradinhos; régua de 2 a 7 quadrados grandes entre dois R com FC = 300 ÷ n e classificação pela diretriz de laudo da SBC 2022 (normal em vigília de 50 a 99 bpm); B1 e B2 sob o traçado.

**Pressão arterial (Korotkoff).** Manômetro aneroide de 0 a 300 mmHg com marcas de 2 mmHg; pera (cada aperto, +15 mmHg), válvula a 2 ou 5 mmHg/s, pulso radial que some acima da sistólica (estimativa palpatória), batimentos a 72 bpm e sons esquemáticos das fases I a IV. Casos: PA normal, Sr. Antônio (156 × 94), sons até zero (registro 150/70/0) e hiato auscultatório. No exercício, o valor numérico e as fases ficam ocultos; o feedback compara a leitura com o caso, aponta inflação insuficiente, desinsuflação rápida e arredondamento, e classifica pela Diretriz de Hipertensão 2025, lembrando que o diagnóstico exige medidas em duas ou mais consultas. As faixas das fases são esquemáticas; o critério de leitura (sistólica na fase I, diastólica na fase V, exceção na fase IV) segue a diretriz de medidas de 2023.

**Pressão venosa jugular.** Vista lateral com cabeceira de 0° a 90°. Modelo: o átrio direito fica cerca de 5 cm abaixo do ângulo esternal na vertical; a coluna venosa sobe até um nível horizontal; a altura h acima do ângulo esternal não muda com a inclinação, só muda onde o topo aparece (ou some atrás da clavícula, ou enche até a mandíbula). Pacientes com PVC de 2, 7 e 14 cmH₂O. A tela declara que o modelo é esquemático e fora de escala.

**Pulsos.** Figura em posição anatômica com trajeto arterial e sete pulsos bilaterais; o poplíteo aparece tracejado por ser posterior.

**Sincronização.** Pulso carotídeo e bulhas no mesmo eixo, com som; opção de sobrepor o pulso radial atrasado.

**Descritor de sopro.** Fase, momento, foco, irradiação, intensidade (Levine I a VI, com frêmito a partir do IV), timbre, qualidade e variação; monta a frase de registro e desenha a forma do sopro no ciclo.

**Edema.** Corte da pele sobre a tíbia, polegar por 2 a 3 s e retorno acelerado com o tempo real indicado. Graus didáticos de 1+ a 4+ (cerca de 2, 4, 6 e 8 mm); a tela informa que as escalas variam entre livros e orienta descrever profundidade e tempo.

**Registro.** Seis linhas do prontuário com opções; atalhos "Exame normal" e "Sr. Antônio"; o que difere do normal fica destacado; siglas por extenso.

Componentes genéricos reutilizáveis: revelação progressiva (sintomas), pontos sobre imagem (inspeção, posições), botão de som (ritmo) e checklist.

## 5. Ilustrações e sons

Incorporadas, convertidas para WebP: N2 (PA), N4 (carótida), N6a e N6b (palpação), 03 (percussão), 04 (posições) e 05 (tórax base, inspeção). Não usadas: 01 (erro na seta do sopro de estenose mitral, já apontado), 02 (foco tricúspide à direita do paciente; a tela de focos usa o tórax vetorial, que segue Porto: base do xifoide, ligeiramente à esquerda), N7a a N7d (substituídas pela imagem 04), e as imagens reaproveitadas do deck de 2025 (sinal de Levine, escala de edema) por não terem licença documentada; o sinal de Levine ficou descrito em texto e o edema ganhou simulador próprio. Para a N4 permanece a observação de revisões anteriores sobre a posição dos dedos.

Sons: todos sintetizados no navegador e rotulados como esquemáticos. Sem resposta sobre o `adultCASE1.mp3`, ele continua fora.

## 6. Decisões tomadas sem consulta (revisáveis)

1. Palpação e ictus em uma tela só, para manter 29 telas.
2. Ritmo e desdobramento mantidos como tela própria, marcada como opcional em sala.
3. Gravações reais não incluídas; a pasta `src/assets/audio` está pronta para recebê-las.
4. Imagem 02 fora; tórax vetorial mantido.

## 7. Arquitetura

Sem mudanças em relação ao protótipo: Vite 5, reveal.js 5, JavaScript puro, SVG e Web Audio; modo estudo sem reveal.js; dois pacotes (site e arquivo único). As imagens são citadas nos slides como `@img/nome.webp` e resolvidas no build (arquivo com hash no site, data URI no arquivo offline). O arquivo offline passou a 2,2 MB por causa das ilustrações.

## 8. Pendências do professor

Revisar a aula no projetor da sala; decidir sobre gravações reais; autorizar e nomear o repositório para o GitHub Pages.

## 9. Resumo

A versão final cobre todo o conteúdo do deck v3 em 29 telas e 50 minutos, com doze componentes interativos. Os simuladores de PA e de PVJ ensinam os dois erros mais comuns de técnica (inflar pouco ou desinsuflar rápido; esquecer que h é vertical). As ilustrações aprovadas foram incorporadas e as que tinham erro ou licença incerta ficaram de fora. Publicação e gravações reais dependem da decisão do professor.
