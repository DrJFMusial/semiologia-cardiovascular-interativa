# Histórico

## 0.2.1 — 2026-10-23

- Preservada a v0.2.0 por ZIP com SHA-256 e comparação dos 60 arquivos com a pasta local.
- Avanço/recuo de 10 ms, relógio no ciclo, teclado Shift + setas; navegação por fase mantida.
- Corrigida classificação numérica nas fronteiras de fase, em particular B2 a 0,42 s.
- Fluxo derivado limitado à fase e exatamente zero em isovolumetria, inclusive bordas.
- Corrigida descrição de B4; documentada divergência com Swartz fornecido.
- Avaliação das respostas do quiz extraída para função testável; sete testes determinísticos.
- Vite 5.4.11 → 7.3.7 e singlefile 2.0.3 → 2.3.4: cinco avisos npm → zero na consulta registrada. Reveal.js mantido.
- Workflow usa Node 22 e exige testes antes do build; não executado remotamente.
- Auditoria, evidências, créditos e roadmap novos. Limitações de pressão/valvas permanecem explícitas.

## 0.2.0 — referência recebida

Nove telas, laboratório do ciclo, anatomia, focos, síntese auditiva, exercício e dois modos de uso. Não havia script `test`; `selfCheck()` era verificação de desenvolvimento. Data histórica de autoria não inferida das datas de arquivos.
