# Entrega final da primeira iteração — v0.2.1

23/10/2026. Prof. João Frederico Musial — Centro Universitário Campo Real — E2M08 — 2026/2.

Esta entrega consolida a primeira iteração auditada. Não representa conclusão de todas as funcionalidades do roadmap nem validação científica integral do curso.

## Uso

Abra `offline/index.html` do pacote final. No computador, o modo inicial é Apresentação; escolha Estudo para explicações complementares. Em telas estreitas, Estudo é o padrão. No laboratório, use ±10 ms ou Shift + setas; as setas sem Shift continuam mudando a fase. Clique no controle Som para ativar síntese esquemática.

## Conteúdo entregue

Nove telas com roteiro, caso, anatomia, laboratório do ciclo, focos, ausculta e exercício. A atualização corrige fronteiras de fase e fluxo em isovolumetria, acrescenta transporte por quadro, revisa B4 e atualiza ferramentas de build. A autoria e a instituição permanecem identificadas.

Fontes, lockfile, sete testes automatizados e documentação acompanham os builds web/offline. A referência original e o histórico Git estão no pacote de segurança. O manifesto SHA-256 permite conferir os arquivos.

## Limites para uso docente

As curvas de pressão são qualitativas e não constituem um modelo hemodinâmico causal validado. Consulte `SCIENTIFIC_VALIDATION.md` antes de interpretar os números ou as diferenças entre curvas. Áudio sintetizado demonstra cronologia, não substitui gravação clínica. PA, PVJ, novos casos e treino de palpação permanecem no roadmap. Revisão por escuta humana, tecnologia assistiva, projetor e outros navegadores permanece pendente.

## Publicação

Repositório público: https://github.com/DrJFMusial/semiologia-cardiovascular-interativa

Aplicação publicada: https://drjfmusial.github.io/semiologia-cardiovascular-interativa/

O código-fonte está na raiz; Pages distribui apenas o resultado do build em `dist/`. PDFs, livros, áudio sem licença e caches não foram enviados. Um bundle contendo exclusivamente o histórico dos fontes foi incluído para recuperação.

A autorização explícita para criação pública, envio de fontes/histórico e publicação foi recebida em 23/10/2026. O primeiro workflow remoto, execução `39899102889`, concluiu com sucesso instalação, sete testes, build e deploy. O site foi aberto no navegador; avanço até 420 ms confirmou o estado de relaxamento isovolumétrico. Evidências locais incluem captura e relatório de recursos HTTP.

## Recuperação

No pacote local, `referencia-original-v0.2.0.zip` preserva a versão recebida, e `git clone historico-e2m08.bundle projeto-restaurado` recupera o histórico local original. No GitHub, `docs/history/historico-e2m08-original.bundle` contém os mesmos commits e tags originais. A importação pelo conector gerou commits remotos próprios, documentados em `docs/history/README.md`. A tag pública `v0.2.1` aponta para o snapshot importado; a referência original está em `baseline/v0.2.0`. Nenhum histórico anterior foi reescrito.
