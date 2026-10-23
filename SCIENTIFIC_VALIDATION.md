# Nota de migração v1.0.0

O texto abaixo documenta a revisão dirigida realizada na v0.2.1 e suas limitações, preservadas nesta migração. Os novos módulos do anexo v1.0.0 foram importados e submetidos a testes funcionais; não se afirma revisão científica integral independente de PA, PVJ, edema ou demais conteúdos novos. Imagens: autoria e revisão declaradas pelo professor no anexo. Todos os áudios continuam sintéticos.

# Validação científica — escopo e limitações

Revisão dirigida em 23/10/2026; não constitui validação clínica integral. Prioridades: cronologia, isovolumetria e descrição de B4. Os relatórios herdados não foram usados como prova de funcionamento.

## Fontes efetivamente consultadas

- Swartz, PDF local `305 - Swartz - Tratado de Semiologia Medica - Coracao.pdf`: capítulo 11, pp. impressas 349–351 (páginas PDF 7–9), ciclo, bulhas e sequência valvar; trecho de percussão localizado por extração. Texto do PDF vascular extraído, sem revisão integral.
- Manual Docente E2M08_2026.2: encontro cardiovascular a partir da página PDF 40; foco em semiotécnica, reconhecimento e registro. Leitura dirigida, não integral.
- [Clinical Methods, capítulo 25: The Fourth Heart Sound](https://www.ncbi.nlm.nih.gov/books/NBK344/): relação pré-sistólica, contração atrial eficaz e complacência ventricular.
- [Clinical Methods, capítulo 24: The Third Heart Sound](https://www.ncbi.nlm.nih.gov/books/NBK342/): B3 na fase de enchimento rápido, interpretação por contexto.
- [HyperHeart, University of Utah](https://library.med.utah.edu/kw/pharm/hyperheart/): página pública consultada como referência conceitual. Não houve inspeção interna completa da animação nem cópia de código, interface ou recursos.
- Porto & Porto é referência herdada, mas nenhum arquivo identificado como Porto foi localizado. Não alegar conferência direta dessa obra. As demais diretrizes listadas no documento legado não foram revalidadas nesta iteração.

## Divergência de B4

Swartz fornecido, p. 350, chama B4 de normal em crianças e adultos jovens. Essa formulação conflita com a orientação explícita do professor. Divergência comunicada no chat; correção autorizada expressamente no pedido: B4 não deve ser ensinada como achado fisiológico habitual nesses grupos. Catálogo atualizado com relação à contração atrial e à complacência; exige contração atrial eficaz, não ocorre na fibrilação atrial. Clinical Methods fundamenta a interpretação, sem transformar toda B4 detectável em diagnóstico isolado.

B3: preservada a possibilidade fisiológica em crianças/jovens. Em adultos, requer contexto de idade e estado hemodinâmico; não é diagnóstico isolado de insuficiência cardíaca. O áudio continua esquemático e não ensina reconhecimento de timbre clínico.

## Matriz de evidência

| Elemento | Natureza e resultado |
|---|---|
| Isovolumetria | Princípio confirmado: valvas fechadas, volume constante. Testes próprios cobrem todo o intervalo, inclusive início; fluxo derivado zerado nessas fases. |
| B1/B2 | Marcos de fechamento AV/semilunares; eventos agregados simplificam diferenças entre lados. Não modela M1/T1 ou A2/P2 no coração animado. |
| ECG e mecânica | ECG ilustrativo; P antecede contração atrial, QRS antecede sístole ventricular. Relação B2/fim de T é aproximação esquemática, não identidade temporal universal. |
| Valores numéricos | 75 bpm, ciclo 0,8 s, VDF 120 mL, VSF 50 mL e curvas de pressão são parâmetros didáticos prescritos, não medições, estimativas individuais ou dados validados. |
| Pressões/valvas | Limitação relevante: curvas independentes e valvas por fase. Em amostragem de 0,1 ms, PVE < PAo por mais de 0,1 mmHg entre 0,4105–0,4199 s com semilunares abertas; PVE > PAE por mais de 0,1 mmHg entre 0,0940–0,1199 s com AV abertas. Não usar para inferir gradientes causais quantitativos. Desaceleração real pode incluir efeitos inerciais; o modelo não resolve inércia. |
| Anatomia | Quatro câmaras e vias em SVG são ilustrativas, fora de escala; lados compartilham dinâmica do VE. Não representa hemodinâmica pulmonar independente, volumes atriais medidos ou variação respiratória. |
| Fluxo visual | Partículas indicam direção e abertura; velocidade não é medida de fluxo. Escala das cavidades não é volumetria anatômica. |
| Focos | Texto explicita que focos não são projeções valvares. Geometria simplificada; revisar figura e alternativas de foco tricúspide com professor antes de expansão. |
| Sequência do exame | Eixo didático preservado. Não generalizar a ordem para todos os sistemas; percussão deve ter limitações explícitas. |

## Antes de ampliar o modelo

Construir modelo causal esquerdo com pressões/volume/valvas compatíveis ou explicitar separadamente diagramas qualitativos sem leitura numérica. Comparar com Wiggers referenciado, testar gradientes e transições e revisar com o professor. Não basta tornar `selfCheck()` mais tolerante: a verificação herdada aceita discrepâncias e não comprova fidelidade fisiológica.

Pendentes: revisão anatômica visual completa, técnicas manuais, manobras, ausculta clínica autêntica e revisão integral do currículo. Nenhuma gravação clínica validada foi adicionada.
