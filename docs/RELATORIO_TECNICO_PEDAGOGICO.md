# Relatório técnico-pedagógico: fases 1 e 2

Semiologia Cardiovascular Interativa · E2M08 · 2026/2 · Prof. João Frederico Musial
Versão do protótipo: 0.2.0 · data: 22/10/2026

## 1. Síntese

O protótipo funcional está pronto e roda em dois modos (apresentação 16:9 e estudo responsivo) a partir do mesmo código. Contém nove telas: capa, roteiro semiológico, caso condutor, anatomia funcional interativa, laboratório do ciclo cardíaco, focos de ausculta com exercício, ausculta multimídia, atividade "Escute e identifique" e um mapa das seções previstas. Todas as interações são reais: nenhuma tela foi substituída por descrição. A fase 3 (expansão) aguarda a validação do professor.

## 2. Fontes efetivamente consultadas

Na pasta "Semiologia Cardiovascular" do computador do professor:

| Fonte | Uso |
|---|---|
| Projeto LuaLaTeX v3 (33 slides) e `Semiologia_Cardiovascular_E2M08_2026-2_v3.pdf` | conteúdo de referência, revisões científicas já feitas, ordem dos slides (mapeamento na seção 7) |
| `Previa_HTML5_Semiologia_Cardiovascular_ALTA_RESOLUCAO` (index.html, README.html, slides em imagem, pasta audios) | diagnóstico: a prévia anterior é uma galeria de imagens dos slides, sem interação; os áudios são declarados sintéticos no próprio README |
| `adultCASE1.mp3` | examinado (14 s, 11 025 Hz); procedência e licença desconhecidas, **não incluído** |
| `Imagens_Semiologia_Cardiovascular_Revisadas` (01 a 05) | avaliadas; reservadas para a fase 3 (seção 9) |
| `Ilustracoes_Semiologia_Cardiovascukar` (N2, N4, N6a, N6b, N7a a N7d) | avaliadas; reservadas para a fase 3 |
| Swartz, coração e vascular (PDF); `Exame_fisico_Cardiovascular.pdf`; `Manual Docente E2M08_2026.2.pdf` | conferência de conteúdo e de escopo do encontro |
| HyperHeart (University of Utah), página pública | estudo de princípios de interface; nada foi copiado (seção 6) |

Não encontrado: a aula de abdome mencionada como referência de ordem prática. A regra "no abdome, ausculta antes da percussão e da palpação" foi aplicada por ser consenso dos livros-texto, não por leitura daquele arquivo.

## 3. Diagnóstico do material atual

O deck v3 é cientificamente revisado e bem ordenado, mas é linear e estático. Três conteúdos dependem de tempo e perdem sentido quando congelados numa imagem: o ciclo cardíaco (sincronia entre valvas, pressões, volume, ECG e bulhas), a ausculta (som) e a pressão venosa jugular (ângulo do leito). A prévia HTML anterior não resolve isso porque apenas exibe as imagens dos slides. Os demais conteúdos (anamnese, sequência, registro) funcionam bem como texto progressivo e não precisam de simulação; neles a interação útil é revelar em etapas e conferir.

## 4. Nova organização da aula

O eixo didático é INSPEÇÃO, PERCUSSÃO, PALPAÇÃO, AUSCULTA, apresentado no roteiro com a distinção explícita entre ordem didática e ordem prática (no coração, PA, pulsos e pescoço vêm antes do precórdio; no abdome, ausculta antes de percussão e palpação). A percussão aparece com indicação de baixo rendimento.

Sequência proposta para a versão completa (≈ 50 min):

| Bloco | Telas | Tempo |
|---|---|---|
| Abertura: capa, roteiro, caso condutor | 3 | 5 min |
| Bases: anatomia funcional, ciclo cardíaco, ECG | 3 | 10 min |
| Anamnese: sintomas e risco | 2 | 4 min |
| Preparação, PA (técnica e Korotkoff), pulsos, pescoço (carótidas e PVJ) | 5 | 10 min |
| Precórdio: inspeção, percussão, palpação | 3 | 5 min |
| Ausculta: focos, estetoscópio e posições, bulhas, B3 e B4, sopros, descrição | 5 | 10 min |
| Periferia, registro, checklist, síntese, referências | 4 a 5 | 6 min |

Total previsto: 25 a 26 telas, dentro do teto de 30.

## 5. Identidade visual

"Atlas clínico": fundo branco-azulado (#fbfcfd), tinta azul-petróleo escuro, cor de destaque petróleo (#0e5462), cinza-azulado para estruturas secundárias. Vermelho e azul são reservados à função circulatória (sangue arterial e venoso, aorta e átrio esquerdo nos traçados), âmbar ao som (bulhas, sopros, selo "som sintetizado"), verde e terracota ao feedback certo e "ainda não". Tipografia Inter (variável) para texto e IBM Plex Mono para números e onomatopeias, ambas embutidas. A composição evita caixas decorativas: separação por filetes, colunas e escala tipográfica. As animações só aparecem quando explicam algo (fluxo, abertura valvar, cursor do tempo, desenho do ECG na capa) e respeitam "reduzir movimento".

## 6. Plano de animação e interação

| Conteúdo | Decisão | Motivo |
|---|---|---|
| Ciclo cardíaco | simulador completo (implementado) | a sincronia é o próprio conteúdo |
| Anatomia | ilustração explorável e percurso do sangue (implementado) | prepara focos e bulhas; sem vista externa, que não acrescenta ao exame |
| Focos | tórax interativo com modo exercício (implementado) | localizar é uma habilidade, treinável por clique com feedback |
| Bulhas e sopros | áudio sincronizado à forma de onda (implementado) | cronologia é o que se ensina; marcas mostram onde cada som cai |
| Fixação | atividade de escuta com feedback explicativo (implementada) | compara a hipótese do aluno com o evento real |
| Korotkoff | simulador de manômetro e sons, com leitura | fase 3 |
| PVJ | animação com ângulo da cabeceira ajustável, rotulando modelo e realidade | fase 3 |
| Palpação do precórdio | ilustrações estáticas progressivas | o gesto é tátil; animar não ensina mais que a imagem certa |
| Anamnese, sequência, registro | revelação progressiva e construtor de registro | texto bem dosado basta |

Princípios do HyperHeart adotados como ideia, com solução própria: eixo de tempo comum a todos os traçados com cursor varrendo; fase atual destacada numa faixa; reprodução, pausa e passo a passo. Diferenças deliberadas: o modelo garante volume constante nas fases isovolumétricas por construção (interpolação monotônica e verificação automática de coerência); B3 e B4 ficam desligadas por padrão, numa camada opcional, para não sugerir que fazem parte do ciclo normal do adulto; as fases são clicáveis; o som pode acompanhar o cursor. Nenhum código, imagem, cor ou texto do HyperHeart foi reproduzido (licença CC BY-NC 4.0).

### Modelo do ciclo (valores ilustrativos, rotulados como tal na tela)

FC 75 bpm (ciclo de 0,8 s). Fases: sístole atrial 0 a 0,12 s; contração isovolumétrica 0,12 a 0,17; ejeção 0,17 a 0,42; relaxamento isovolumétrico 0,42 a 0,50; enchimento rápido 0,50 a 0,63; diástase 0,63 a 0,80. B1 no fechamento das AV (0,12), B2 no fechamento das semilunares, ao fim da onda T (0,42), B3 a 0,18 s de B2, B4 durante a contração atrial. Volume diastólico final 120 mL, sistólico final 50 mL; pressão do VE até 120 mmHg; aorta entre 80 e 120 mmHg com incisura; átrio esquerdo com ondas a, c e v. Estado das valvas, tamanho das câmaras, tensão da parede e partículas de fluxo derivam do modelo: não há fluxo nas fases isovolumétricas.

## 7. Mapeamento dos 33 slides originais

| # | Slide original | Destino | Situação |
|---|---|---|---|
| 1 | Capa | 01 Capa refeita (ECG com B1 e B2) | protótipo |
| 2 | O que vamos fazer hoje | 02 Roteiro semiológico; lista de objetivos na fase 3 | parcial (roteiro) |
| 3 | O caso que vai nos acompanhar | 03 Caso condutor | protótipo |
| 4 | O coração que vamos examinar | 04 Anatomia funcional interativa | protótipo |
| 5 | Ciclo cardíaco: onde nascem B1 e B2 | 05 Laboratório do ciclo | protótipo |
| 6 | Eletrocardiograma (ECG) normal | camada ECG do laboratório + tela própria anotada | parcial; tela própria na fase 3 |
| 7 | Referências do tórax | linhas, ângulo esternal e EIC no tórax dos focos | parcial; modo "referências" na fase 3 |
| 8 | Anamnese: cinco sintomas | Anamnese, revelação progressiva | fase 3 |
| 9 | Anamnese: esforço, dor e risco | Anamnese | fase 3 |
| 10 | Antes de tocar: preparação e sequência | Preparação, lista conferível | fase 3 |
| 11 | PA (1): técnica | PA, sequência de passos | fase 3 |
| 12 | PA (2): Korotkoff | simulador de Korotkoff com exercício | fase 3 |
| 13 | Pulsos arteriais | mapa de pulsos interativo | fase 3 |
| 14 | Pescoço: carótidas e aorta | Pescoço | fase 3 |
| 15 | Pescoço: jugulares e PVJ | animação da PVJ com ângulo ajustável | fase 3 |
| 16 | Precórdio 1: inspeção | ilustração progressiva | fase 3 |
| 17 | Precórdio 2: percussão | tela breve (imagem 03) + roteiro | parcial (roteiro) |
| 18 | Precórdio 3: palpação | ilustrações progressivas | fase 3 |
| 19 | Palpação: ictus, impulsões e frêmitos | idem | fase 3 |
| 20 | Precórdio 4: focos | 06 Focos com exercício | protótipo |
| 21 | Estetoscópio e sincronização | Ausculta: estetoscópio e pulso carotídeo | fase 3 |
| 22 | Ausculta: posições | imagem 04 revisada | fase 3 |
| 23 | B1 e B2 | 07 Ausculta (normal) | protótipo |
| 24 | Ritmo, frequência e desdobramento | 07 (desdobramento) + ritmo | parcial |
| 25 | B3 e B4 | 07 + camada B3/B4 do laboratório | protótipo |
| 26 | Sopros: identificar e situar | 07 (sistólico e diastólico) | protótipo |
| 27 | Como descrever um sopro | descritor interativo (fase, forma, foco, irradiação, intensidade) | fase 3 |
| 28 | Periferia: edema | tela com escala de cacifo | fase 3 |
| 29 | Registro: exame normal | construtor de registro | fase 3 |
| 30 | Registro: Sr. Antônio | construtor de registro | fase 3 |
| 31 | Checklist da estação | checklist interativo (sem armazenamento) | fase 3 |
| 32 | Para levar | síntese final | fase 3 |
| 33 | Referências | Referências e créditos | fase 3 |
| novo | Atividade "Escute e identifique" | 08 | protótipo |

## 8. Arquitetura e justificativa

Site estático com Vite 5 e reveal.js 5, em JavaScript puro (módulos ES), sem React. Os simuladores são SVG atualizados por `requestAnimationFrame`; um framework de componentes acrescentaria peso e uma camada de renderização sem ganho para esse tipo de gráfico. O reveal.js resolve escala sem corte do quadro 1600 × 900, notas do apresentador, progresso e navegação. No modo estudo o reveal.js não é iniciado: as mesmas seções viram um documento rolável e responsivo, porque a visualização em rolagem do reveal.js apenas reduz o quadro 16:9, ilegível no celular.

Componentes são registrados por `data-component` e ativados por visibilidade real (IntersectionObserver): saem de cena pausados, nos dois modos. Teclas usadas por um simulador não chegam ao reveal.js, então as setas mudam a fase e não o slide. O áudio é Web Audio: nenhum som toca sem clique, há volume e mudo globais e pausa geral.

Dois pacotes: `dist/` para o GitHub Pages (caminhos relativos) e `dist-offline/index.html`, arquivo único de cerca de 440 kB com tudo embutido, que abre com duplo clique sem internet.

## 9. Ilustrações e sons

Ilustrações do protótipo: todas desenhadas em código para este projeto (coração, traçados, tórax, ECG da capa, ícones). As imagens revisadas e as ilustrações do professor serão usadas na fase 3 conforme o mapeamento; duas ressalvas permanecem: na imagem 02 o foco tricúspide está à direita do paciente, enquanto Porto o situa na base do xifoide, ligeiramente à esquerda (o tórax web segue Porto); a imagem 01 segue fora de uso pelo erro já apontado na seta do sopro de estenose mitral.

Sons: todos sintetizados no navegador, marcados em cada tela como "Som sintetizado esquemático". Ensinam cronologia, não timbre. Nenhuma gravação clínica foi incluída porque nenhuma fonte com licença compatível foi verificada nesta fase. O `adultCASE1.mp3` só entra se a procedência e a licença forem documentadas.

## 10. Pendências e decisões do professor

1. Validar identidade visual, ritmo das telas e o laboratório do ciclo antes da expansão.
2. Informar a procedência do `adultCASE1.mp3` ou autorizar a busca de gravações com licença aberta, a conferir uma a uma.
3. Decidir sobre a imagem 02 (corrigir a posição do foco tricúspide ou manter o tórax vetorial).
4. Escolher nome do repositório e autorizar a publicação no GitHub Pages (instruções em `PUBLICACAO_GITHUB_PAGES.md`).
5. Confirmar se o modo estudo deve trazer texto complementar por tela (já existe no laboratório e nos focos) ou ficar idêntico ao de apresentação.

## 11. Resumo

O protótipo entrega os sete elementos mínimos pedidos, com interação real, dois modos de uso, funcionamento offline e verificação de coerência fisiológica embutida. A arquitetura separa núcleo e conteúdo, o que permite expandir a aula e reaproveitar a base em outras. As decisões que dependem do professor são a validação visual, a política de gravações reais, a imagem 02 e a publicação.
