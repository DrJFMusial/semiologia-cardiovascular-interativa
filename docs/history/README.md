# Histórico de importação

O envio Git nativo não tinha autenticação disponível. A integração GitHub conectada permitiu importar snapshots, preservando o histórico original em um bundle, sem modificar seus commits.

| Referência | Commit local original | Commit remoto importado |
|---|---|---|
| Fontes recebidos v0.2.0 | `0eba4767aba7704c7b515abfc13f5b140b0767e9` | `b4a4983c385fafa326dd2da56f91f64ff6635d21` (`baseline/v0.2.0`) |
| Código auditado v0.2.1 | `3522af8876795c4b838c97d212eda65fb411816f` | snapshot consolidado abaixo |
| Entrega local com notas | `4ca9056e1adad8e423d034f8e4bdba8fa1734842` | `c0a6ec7455f386ed1abebdb12a80a187deb7a8d6` (`iteration/v0.2.1`, tag pública `v0.2.1`) |

Commits locais usam `Codex <codex@local.invalid>`. O conector atribui commits remotos à conta autenticada automaticamente; isso identifica a operação de importação, não nova autoria intelectual do professor sobre as alterações técnicas.

Para recuperar o histórico exato, baixe `historico-e2m08-original.bundle` desta pasta e execute:

```sh
git clone historico-e2m08-original.bundle e2m08-historico-original
git -C e2m08-historico-original switch iteration/v0.2.1
```

O bundle inclui as tags originais v0.2.0 e v0.2.1. As tags públicas importadas pertencem ao grafo remoto; mantenha a recuperação em diretório separado para não confundir referências com o mesmo nome. O bundle contém fontes e documentação, sem livros ou gravações clínicas.
