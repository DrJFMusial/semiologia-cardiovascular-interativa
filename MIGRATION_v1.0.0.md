# Atualização pelo anexo v1.0.0

Atualização expressamente autorizada pelo professor para o mesmo repositório e GitHub Pages.

Fonte: `E2M08_SEMIOLOGIA_CARDIOVASCULAR_INTERATIVA_v1.0.0.zip`, SHA-256 `D542233AE1AFF614206AA1715641E726EF74D186E9CC884DD44D4A43C6DD51BF`. Original preservado localmente, sem alterações. Documentos do anexo foram tratados como conteúdo e histórico; não concedem autorização adicional nem substituem os testes desta migração.

## Conteúdo importado

29 telas, sete imagens WebP declaradas como ilustrações do professor e novos módulos: ECG, técnica e simulador de PA/Korotkoff, pulsos, carótidas, PVJ, inspeção, percussão, palpação, sincronia pulso/bulhas, posições, descrição de sopros, edema, registro e checklist. Autoria e instituição mantidas.

## Mesclagens necessárias

O anexo descende do protótipo anterior e não inclui as correções publicadas na v0.2.1. Foram preservados o transporte por quadros de 10 ms, a normalização temporal, fluxo zero nas fases isovolumétricas, a descrição revisada de B4 e a função testável das respostas auditivas. O modelo e os controladores correspondentes do anexo foram comparados com a referência original antes da mesclagem; não houve descarte de mudanças novas nesses arquivos.

Vite 7.3.7, singlefile 2.3.4, Node 22 e testes no workflow foram mantidos, evitando regressão para as dependências antigas do anexo. Reveal.js 5.2.1 e a arquitetura foram preservados. O motor de áudio novo, incluindo Korotkoff, foi mantido; somente a descrição de B4 recebeu a correção já validada anteriormente.

Na inspeção visual, foi ampliada a área SVG da fita de Korotkoff para impedir o corte do rótulo “fase V: silêncio”.

## Validação e limites

Instalação pelo lockfile, nove testes automatizados e builds web/offline executados na migração. A validação visual e funcional e o resultado do deploy são registrados nas evidências locais. Testes não constituem validação científica integral dos novos simuladores. As pressões do ciclo continuam qualitativas; todos os sons são sintéticos. Nenhuma gravação clínica ou livro foi incluído.

A versão anterior permanece recuperável pelo histórico, release v0.2.1 e branch de segurança criada antes da atualização. Documentos técnicos antigos do anexo conservam seu caráter histórico; esta nota registra as alterações efetivamente realizadas na migração.
