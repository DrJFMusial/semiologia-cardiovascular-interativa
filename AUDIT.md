# Auditoria da primeira iteração

Data: 23/10/2026. Escopo: reconhecimento completo de arquivos do protótipo, revisão dirigida de código/conteúdo e incremento delimitado. Não confundir com validação científica integral do curso.

## Identificação e preservação

ZIP dos Downloads, ZIP na pasta e referência preservada: SHA-256 `885CE659C196DFE74FC1D98931EF600E3DA8E053CAD056E0D2782B3BAF984EBD`. Os 60 arquivos do ZIP coincidem por conteúdo com a pasta `E2M08_SEMIOLOGIA_CARDIOVASCULAR_INTERATIVA`; nenhuma versão mais recente inferida por data. HTML offline dos Downloads, do ZIP e de Claude outputs também idênticos: SHA-256 `84C1B1383ACD968E72BA2628F231455E1179AB083AFD9E4C16BD081B14289297`.

Inventários CSV e comparação ficam em `../auditoria/`. `../baseline/v0.2.0.zip` e sua extração permanecem intactos. `../baseline-run/` é cópia descartável usada para instalar/buildar a referência; `app/` contém a evolução.

| Grupo encontrado | Papel |
|---|---|
| ZIP v0.2.0 e pasta INTERATIVA | Fonte executável modular e artefatos compilados equivalentes |
| `codigo-fonte/src`, package/lock, Vite config | Projeto-fonte: 9 slides, 6 fábricas interativas, CSS, fontes locais |
| `site-github-pages`, HTML offline | Distribuições compiladas; não são fonte editável primária |
| Prévia ALTA_RESOLUCAO e projetos 2025/2026-2 | Materiais anteriores e recursos de aula; não substituíram a referência por data |
| Swartz, Manual Docente, apresentações e ilustrações | Fontes acadêmicas/visuais locais; revisão dirigida dos textos descrita na validação científica |
| `adultCASE1.mp3` | Áudio sem procedência/licença demonstrada; fora do produto |
| `Claude outputs` | Saídas anteriores; não usadas como prova de testes |

Não foram alterados nem apagados materiais originais. Recursos antigos são mantidos para recuperação. Não há biblioteca de áudio externa ou imagens raster usadas pela aplicação executável. Dependências diretas existentes têm uso identificado. Há código aparentemente dispensável (`active` no ciclo, função onSlideChange não integrada, filtro SVG não usado), mas sem remoção nesta iteração.

## Diagnóstico técnico

Boa separação entre modelo, visualização e núcleo; arquitetura adequada ao tamanho. Estado por componente e navegação por Reveal/adaptador permitem modo estudo sem reduzir o slide inteiro. Interpolação monotônica preserva os patamares de volume.

Problemas confirmados:

| Prioridade | Achado | Situação |
|---|---|---|
| P0 | B4 descrita como possível achado em jovens sem distinção adequada | Corrigido conforme orientação explícita; divergência com Swartz registrada |
| P0 | Curvas independentes não sustentam gradientes em todo o ciclo | Documentado e aviso no modo estudo; revisão causal pendente |
| P1 | Normalização por módulo altera classificação do limite exato 0,42 s | Corrigido e testado |
| P1 | Diferença finita de volume atravessa bordas, produzindo `dv` não nulo no início da isovolumetria | Corrigido com domínio restrito à fase e zero isovolumétrico |
| P1 | Sem testes automatizados executáveis; selfCheck aceita tolerâncias e exclui bordas | Suíte Node criada; selfCheck não tratado como garantia clínica |
| P1 | Cinco avisos npm (quatro altos, um moderado) na referência | Vite/singlefile atualizados; zero avisos na consulta posterior registrada |
| P1 | Exercício do tórax depende de posição do ponteiro | Pendente; focos no modo exploração já têm teclado |
| P2 | Sem avanço por quadro real | Implementados ±10 ms, relógio e atalhos |
| P2 | Erros de Web Audio e promessas de fullscreen/resume com tratamento limitado | Pendente; execução verificada em Chrome não garante outros ambientes |
| P2 | Baralho usa sort aleatório enviesado e progressão do caso condutor está incompleta | Pendente; não impede a pequena rodada atual |
| P2 | Redução de movimento depende de CSS e controles; UI de velocidade pode divergir após limitar velocidade no play | Pendente; exigir QA específico antes de afirmar conformidade |

Não há backend, segredos, autenticação ou coleta de dados identificados. Conteúdo inserido por innerHTML é local e controlado; reavaliar caso sejam aceitos textos externos. Não declarar segurança absoluta com base em npm audit.

## Diagnóstico visual e pedagógico

Fundo claro, petróleo e fontes locais formam identidade consistente. SVG nítido e composições distintas por tema são adequados. Inspeção própria do laboratório em 1920×1080, 1366×768 e 390×844: controles acessíveis e sem transbordamento horizontal do documento. No celular, curvas mantêm largura e exigem rolagem horizontal interna; há aviso. Legendas pequenas dos gráficos podem limitar leitura em projetores distantes: validar presencialmente. Não foi medido contraste de todos os elementos nem testado leitor de tela.

Progressão capa → roteiro → caso → anatomia → ciclo → focos → sons → atividade é apropriada para introdução. Feedback auditivo explica alternativas e o rótulo de som esquemático é explícito. A apresentação é protótipo de nove telas: PA, PVJ, palpação e registro permanecem planos, não funcionalidades implementadas. O Manual privilegia execução e OSCE; priorizar checklist de técnica e registro antes de multiplicar simuladores. Percussão deve ser ensinada com limites, sem tratar a ordem didática como regra universal.

## Resultados e limites dos testes

- Referência v0.2.0: instalação por lockfile e build web/offline executados; sem script test original. Bundle web JavaScript 251,35 kB; HTML offline 440,75 kB nesta reprodução. Hash do bundle web original reproduzido; diferença de tamanho do HTML offline recebido não prova versão mais nova.
- v0.2.1: sete testes Node aprovados; 8.000 amostras para direções de volume/valvas e 200 amostras isovolumétricas, limites exatos e 36 combinações de respostas.
- Chrome headless real: três resoluções, modos, avanço/recuo, Shift + setas, play/pause/reset, valvas em B2, áudio Web Audio ativo e buffer não silencioso, abertura `file://` offline com nove slides.
- Nenhum erro JavaScript ou HTTP ≥400 observado no roteiro executado; isso não cobre todos os caminhos da UI.
- Gravações de evidência em `../auditoria/`: screenshots, logs, JSON de navegador e auditorias npm. Qualidade de timbre e fidelidade fisiológica não são validadas por buffer/screenshot.
- Não verificados: escuta humana, Firefox/Safari, dispositivo móvel físico, projetor, lector de tela, Pages público e workflow remoto.

## GitHub

Consulta somente leitura pelo plugin retornou três repositórios acessíveis, nenhum destinado inequivocamente a E2M08. Destino proposto: `DrJFMusial/semiologia-cardiovascular-interativa`, ainda não criado. Não foram enviados arquivos, criados repositórios, branches remotas, PRs ou deploys.

Histórico Git local criado com identidade técnica `Codex <codex@local.invalid>`, sem atribuir novos commits ao professor: `main`/tag `v0.2.0` guardam os fontes recebidos; `iteration/v0.2.1` guarda a evolução e será marcada com `v0.2.1`. Sem remote configurado. O ZIP original preserva também os compilados recebidos.

Estrutura remota proposta: conteúdo de `app/` na raiz; documentos, fontes, lockfile, testes, licenças e `.github/workflows/deploy.yml`. Excluir livros, PDFs, backups, caches, node_modules e dist do Git. Pages receberá somente `dist/` como artifact. Antes de qualquer envio, o professor aprova nome, visibilidade e criação/envio/configuração de Pages. Depois do deploy, confirmar URL pública e recursos; nunca usar build local como prova de publicação.
