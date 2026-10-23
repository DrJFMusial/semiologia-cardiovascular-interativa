# Semiologia Cardiovascular Interativa

E2M08 · Introdução à Propedêutica Médica · Semestre 2026/2
Prof. João Frederico Musial · Medicina · Centro Universitário Campo Real

Aplicação: https://drjfmusial.github.io/semiologia-cardiovascular-interativa/

**Tema claro/escuro:** use o botão **Tema** (lua) na barra da aula. Sua preferência é salva no navegador. Detalhes em [THEMES.md](THEMES.md).

Migração do anexo v1.0.0 com preservação das correções técnicas e da descrição de B4 da v0.2.1. Veja [MIGRATION_v1.0.0.md](MIGRATION_v1.0.0.md).

Aplicação educacional estática (HTML5, CSS, JavaScript) para a aula de semiologia cardiovascular. Um único código serve a dois usos:

- **Modo apresentação**: tela 16:9 (1600 × 900) escalada sem corte para qualquer projetor, navegação por setas, notas do apresentador.
- **Modo estudo**: documento rolável e responsivo para computador e celular, com os mesmos simuladores e textos complementares.

Versão atual: **1.1.0, com tema claro/escuro opcional (29 telas, cerca de 50 min)**. Não há back-end, login nem coleta de dados.

## Requisitos

- Node.js 22.12+ e npm.
- Navegador atual: Chrome, Edge ou Firefox.

## Instalar e executar

```bash
npm ci               # instala as versões exatas do lockfile
npm test             # regressões do modelo, quiz e integridade da aula
npm run dev          # servidor local com recarga automática (http://localhost:5173)
```

Modos por endereço: `?modo=apresentacao` ou `?modo=estudo`. Em telas com até 820 px de largura o modo estudo é o padrão.

## Gerar os pacotes

```bash
npm run build          # dist/          site estático para o GitHub Pages ou qualquer servidor
npm run build:offline  # dist-offline/  um único index.html autocontido (abre com duplo clique, sem internet)
npm run build:all      # os dois
npm run preview        # serve o dist/ localmente para conferência
```

O `dist/` usa caminhos relativos (`base: './'`) e funciona em qualquer subdiretório. O `dist-offline/index.html` traz JavaScript, estilos e fontes embutidos; é o arquivo indicado para a sala de aula quando não houver rede.

## Atalhos

| Tecla | Ação |
|---|---|
| ← → | Slide anterior ou seguinte (fora dos simuladores) |
| Clique no simulador, depois ← → | Fase anterior ou seguinte do ciclo (não troca de slide) |
| Espaço | Reproduzir ou pausar o ciclo (com o simulador em foco) |
| ↑ ↓ | Trocar o som na ausculta; no simulador de PA, ↑ infla; na PVJ, muda a cabeceira |
| Espaço (simulador de PA em foco) | Abrir ou fechar a válvula |
| M | Menu de seções |
| X | Pausar todas as animações e sons (P continua sendo "slide anterior" no Reveal) |
| S | Notas do apresentador (janela própria) |
| F | Tela cheia |
| Home | Voltar à capa |
| Esc | Fechar menu, limpar seleção |

## Estrutura

```
index.html                 casca da aplicação
public/favicon.svg
src/
  main.js                  monta os slides, escolhe o modo, registra componentes
  slides/NN-nome.html      um arquivo por slide, em ordem alfabética
  components/              roteiro, registro e componentes genéricos (revelar, pontos sobre imagem, som, checklist)
  simulators/
    cycle/                 modelo fisiológico, coração SVG, traçados, laboratório
    anatomy/               anatomia funcional
    focos/                 tórax e focos de ausculta, com exercício
    ausculta/              sons esquemáticos sincronizados com forma de onda
    quiz/                  atividade "Escute e identifique"
    ecg/                   ECG em papel milimetrado, intervalos e régua de FC
    korotkoff/             manômetro, pera, válvula e sons de Korotkoff (explorar e exercício)
    pulsos/                mapa de pulsos arteriais
    pvj/                   pressão venosa jugular com cabeceira ajustável
    sincronia/             pulso carotídeo e bulhas ("quem é B1?")
    sopro/                 descritor de sopro (sete características, Levine)
    edema/                 cacifo e graus
  core/                    áudio, registro de componentes, barra, ícones e teclado
  styles/                  tokens, base, slides, componentes, coração, fontes
  assets/fonts/            Inter e IBM Plex Mono (OFL 1.1), subconjunto latino
  assets/images/           ilustrações do professor (webp), citadas nos slides como @img/nome.webp
  assets/audio/            reservado para gravações com licença compatível (hoje vazio)
docs/                      relatório, mapeamento, créditos, QA, publicação
.github/workflows/         publicação automática no GitHub Pages (inativa até haver repositório)
```

### Acrescentar um slide

1. Criar `src/slides/NN-nome.html` com `<section data-section="Seção" data-menu-title="Título no menu"> … <aside class="notes">…</aside></section>`.
2. Para um componente interativo, incluir `<div data-component="nome" class="fill"></div>` e registrar a fábrica em `src/main.js` com `register('nome', fabrica)`. A fábrica recebe o elemento e pode devolver `activate`, `deactivate` e `pause`; o registro chama essas funções quando o slide entra ou sai de cena.

### Acrescentar outra aula

O núcleo (`src/core`, estilos e simuladores) é independente do conteúdo. Uma nova aula é uma nova pasta de slides; a seleção pode ser feita por variável de ambiente no `vite.config.js` ou por cópia do projeto.

## Publicação no GitHub Pages

O professor autorizou a atualização da aplicação publicada. Envio a main executa testes, build e deploy pelo GitHub Actions. Instruções completas em [`docs/PUBLICACAO_GITHUB_PAGES.md`](docs/PUBLICACAO_GITHUB_PAGES.md).

## Dependências

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| reveal.js | 5.2.1 | MIT | motor de apresentação e notas do apresentador |
| vite | 7.3.7 | MIT | servidor de desenvolvimento e build (só desenvolvimento) |
| vite-plugin-singlefile | 2.3.4 | MIT | build offline em arquivo único (só desenvolvimento) |

Fontes: Inter e IBM Plex Mono, SIL Open Font License 1.1, incluídas em `src/assets/fonts`. Créditos completos em [`docs/CREDITOS_E_LICENCAS.md`](docs/CREDITOS_E_LICENCAS.md).
