# Oportunidades Arquiteturais Reveladas pelo Modelo Epistemológico

> O modelo (6 estados + proveniência) usado como CRITÉRIO DE AVALIAÇÃO dos componentes.
> Identifica inconsistências arquiteturais reais. Prioriza por impacto.
> SEM soluções. SEM refatorações. SEM implementação.
>
> Data: 2026-07-12
> Método: descoberta conceitual → evolução arquitetural baseada em evidências
> Base de evidência: EXPERIMENT_MODEL_VS_REALITY.md + _DOWNSTREAM.md (16 informações reais classificadas)

---

## Critério de Avaliação

Uma inconsistência arquitetural existe quando o componente:
- **(C1)** produz informação de um estado epistêmico mas a apresenta como outro (inflação de estatuto)
- **(C2)** colapsa dois estados distintos numa mesma forma (perda de distinção)
- **(C3)** produz informação sem preservar sua proveniência (linhagem quebrada)
- **(C4)** embute uma política/norma/decisão sem marcá-la como tal (política oculta)
- **(C5)** atribui a um componente uma transformação que pertence a outro estado da cadeia (transformação mal-posicionada)

Cada oportunidade abaixo cita o critério violado + evidência de output real.

---

## Oportunidade #1 — Decisão Disfarçada de Observação (default `npm`)

**Componente:** ProjectLoader (`detectPackageManager`, linha 121)

**Critérios violados:** C1 + C4

**Inconsistência:** Quando nenhum lock file existe, retorna `"npm"`. Isto é uma DECISÃO (política "na dúvida, npm") apresentada com forma idêntica a uma inferência observada (`"pnpm"` a partir de lock file). Nada distingue, no output, "vi pnpm-lock logo pnpm" de "não vi nada logo chuto npm".

**Evidência real:** Run PHP (hubcrm-optadev) → `packageManager: "npm"` sem existir nenhum lock file no projeto.

**Impacto arquitetural: MÁXIMO.**
- É a informação MAIS A MONTANTE do pipeline a estar corrompida.
- Propaga-se: envenena DevRole (que gera "constraint: sem test script npm" para projeto PHP).
- Um consumidor downstream não pode saber que este valor é um chute. Trata com mesma autoridade que evidência sólida.
- Um sistema que não distingue "vi" de "assumi" não pode raciocinar sobre a própria confiança. Esta é a raiz dessa incapacidade.

**Por que é #1:** máxima montante + propagação comprovada + viola dois critérios + é a raiz da impossibilidade de auto-avaliação de confiança.

---

## Oportunidade #2 — Ausência-de-Observação Colapsada com Observação-de-Ausência (arrays vazios)

**Componente:** ProjectLoader (`detectTechnologies` → `[]`, `extractScripts` → `{}`)

**Critério violado:** C2

**Inconsistência:** `technologies: []` significa duas coisas epistemicamente opostas, indistinguíveis no output:
- (a) "observei e não há tecnologias" — inferência
- (b) "não sei observar tecnologias deste ecossistema" — ausência de observação

**Evidência real:** Run PHP → `technologies: []`, `scripts: []`. A verdade é (b) — ProjectLoader só olha package.json, é cego a PHP. Mas o output é idêntico a (a).

**Impacto arquitetural: ALTO.**
- DevRole interpreta `[]` como (a) e gera "No known technologies detected" (constraint = problema). Mas a verdade (b) não é problema do projeto — é cegueira do observador.
- O erro de interpretação downstream é DIRETO consequência do colapso a montante.
- Afeta TODOS os projetos fora do ecossistema Node.js — o caso de uso real que motivou todo este ciclo.

**Por que é #2:** afeta a classe inteira de projetos não-Node (impacto largo), causa erro downstream comprovado, mas é um degrau menos venenoso que #1 (não inventa um valor falso, apenas perde uma distinção).

---

## Oportunidade #3 — Interpretação Produzida na Fase Declarada "Coleta de Fatos" (relevância)

**Componente:** ProjectLoader (`findRelevantFiles`, whitelist linhas 83-88) + herança em ContextBuilder

**Critérios violados:** C1 + C4 + C5

**Inconsistência:** `RelevantFiles` apresenta "relevância" como se fosse propriedade observável do arquivo. Relevância é INTERPRETAÇÃO sob um propósito (Node.js). A whitelist (package.json, tsconfig, CLAUDE.md, README) é uma política de relevância não-declarada, embutida na fase que ADR-004 declara ser de "coleta de fatos".

**Evidência real:** Todos os runs. `composer.json` (PHP) nunca entra em RelevantFiles porque não está na whitelist Node.js — mesmo sendo o arquivo mais relevante de um projeto PHP.

**Impacto arquitetural: ALTO.**
- Contradiz diretamente ADR-004 ("ProjectLoader coleta fatos, não interpretação"). A interpretação já vazou para dentro do ProjectLoader, silenciosa.
- É interpretação sob propósito NÃO-declarado (Node.js), duplamente oculta.
- Define o que ContextBuilder consegue ler — limita todo o downstream ao recorte Node.js.

**Por que é #3:** viola três critérios e um ADR explícito, mas o dano é "não ver o que importa" (omissão) e não "afirmar falso" (comissão como #1). Estruturalmente grave, operacionalmente menos agudo.

---

## Oportunidade #4 — Inflação Interpretação→Conhecimento (KnowledgeArtifact)

**Componente:** RoleOutput / MemoryWriter (o que se chama "KnowledgeArtifact")

**Critérios violados:** C1 + (parcialmente) o ciclo aberto

**Inconsistência:** O que se persiste como "Knowledge" é INTERPRETAÇÃO não-validada que nada relê. Pelo critério do modelo, conhecimento = interpretação validada que reorienta ação futura. O artifact não é validado nem reorienta nada (nenhum componente carrega artifacts de volta).

**Evidência real:** Artifact em disco: "Project uses TypeScript for type safety" + "Implies strict type checking". MemoryWriter escreve; nenhum componente lê `memory/` de volta (verificado: só há `write`, nenhum `read`).

**Impacto arquitetural: MÉDIO-ALTO.**
- Nome "Knowledge" promete um ciclo fechado que não existe (Hipótese Oculta nº 5).
- Ou o pipeline está incompleto (falta o consumo do conhecimento) ou persiste-se por fé, sem consumidor. Ambos são problemas arquiteturais.
- Toca o PROPÓSITO do Harness: "motor de orquestração que persiste conhecimento". Se o conhecimento nunca fecha ciclo, o propósito central não está cumprido.

**Por que é #4:** impacto alto no PROPÓSITO, mas não corrompe dados existentes (diferente de #1-3). É uma lacuna (falta o ciclo), não uma corrupção. Alto valor, urgência menor.

---

## Oportunidade #5 — Norma de Valor Embutida sem Proveniência (constraints)

**Componente:** DevRole / ContextBuilder (`identifyConstraints`)

**Critérios violados:** C4 + C3

**Inconsistência:** "No test script defined" é uma constraint (juízo de que algo está errado). Assume a NORMA "todo projeto deve ter test script". Essa norma é (a) Node.js-cêntrica e (b) invisível — não está registrada em lugar rastreável, está codificada em `if (!scripts.test)`.

**Evidência real:** Run PHP gera 5 constraints, incluindo "No test script defined" — mas PHP usa phpunit, não npm test. A norma embutida é falsa para o ecossistema.

**Impacto arquitetural: MÉDIO.**
- Produz juízos falsos fora de Node.js (constraint que não é constraint).
- A norma invisível não pode ser auditada nem ajustada por ecossistema.
- PORÉM: já está parcialmente coberto pela ADR-CONTEXT-RESPONSIBILITY (interpretação deve ir para Role). Este é um sintoma daquele problema já-conhecido, agora com lente epistemológica.

**Por que é #5:** dano real mas já parcialmente mapeado por ADR existente; menos "novo" que #1-4.

---

## Oportunidade #6 — Confiança Não é Atributo de Primeira Classe (inferências fortes vs. fracas)

**Componente:** transversal (ProjectLoader + ContextBuilder)

**Critério violado:** C2

**Inconsistência:** Inferências de confiança radicalmente diferente têm forma idêntica no output. `codeStyle: TypeScript` (salto sólido) e `namingConvention: App Router` (salto INVÁLIDO — Next.js tem App e Pages Router) são apresentadas identicamente.

**Evidência real:** Run Next.js → conventions com ambas, sem qualquer marca de que uma é sólida e outra é chute.

**Impacto arquitetural: BAIXO-MÉDIO.**
- Downstream não pode ponderar por confiança.
- MAS: nenhum consumidor atual usa confiança para decidir nada. É um problema latente, não ativo.
- Torna-se importante só quando o Harness precisar priorizar/filtrar por confiança.

**Por que é #6:** real, transversal, mas sem consumidor prejudicado hoje. Latente.

---

## Oportunidade #7 — Proveniência Não é Preservada na Cadeia (linhagem descartada)

**Componente:** transversal (todo o pipeline)

**Critério violado:** C3

**Inconsistência:** Cada informação é produzida e passada adiante como valor nu. `mainFramework: "Next.js"` não carrega "derivei de technologies, que derivei de package.json deps". A linhagem existe conceitualmente (rastreamos manualmente nos experimentos) mas o pipeline não a materializa.

**Evidência real:** Artifact em disco tem `Related Components: ProjectLoader, ContextBuilder` — tentativa RUDIMENTAR de proveniência, mas registra "quais componentes tocaram" e não "de que informação isto depende". Proveniência de componente ≠ proveniência de informação.

**Impacto arquitetural: FUNDACIONAL, mas DIFUSO.**
- É a condição que torna #1, #5, #6 invisíveis: sem linhagem, não se pode auditar estatuto nem confiança nem norma.
- PORÉM: é o mais próximo de "reescrever como a informação flui" — impacto de implementação enorme, e ainda sem consumidor que exija.
- É pré-requisito conceitual das outras, mas a última em urgência prática.

**Por que é #7:** fundacional (habilita as demais) mas difuso e sem consumidor imediato. Investir aqui primeiro seria abstração prematura (viola ADR-009). Deve emergir da necessidade das oportunidades acima, não precedê-las.

---

## Lista Priorizada (por Impacto Arquitetural)

| # | Oportunidade | Componente | Critérios | Impacto | Natureza |
|---|-------------|-----------|-----------|---------|----------|
| 1 | Decisão disfarçada de observação (`npm` default) | ProjectLoader | C1+C4 | **MÁXIMO** | Corrupção, máx. montante |
| 2 | Ausência-de-obs colapsada (`[]`, `{}`) | ProjectLoader | C2 | **ALTO** | Perda de distinção, classe inteira não-Node |
| 3 | Interpretação na fase "coleta" (relevância) | ProjectLoader | C1+C4+C5 | **ALTO** | Viola ADR-004, omissão estrutural |
| 4 | Inflação Interpretação→Conhecimento | RoleOutput/MemoryWriter | C1 | **MÉDIO-ALTO** | Lacuna no propósito central |
| 5 | Norma de valor sem proveniência (constraints) | DevRole/ContextBuilder | C4+C3 | **MÉDIO** | Já parc. coberto por ADR |
| 6 | Confiança não é 1ª classe | transversal | C2 | **BAIXO-MÉDIO** | Latente, sem consumidor |
| 7 | Proveniência não preservada | transversal | C3 | **FUNDACIONAL/DIFUSO** | Pré-requisito das demais, sem urgência |

---

## Padrão Arquitetural Revelado

As 7 oportunidades não são independentes. Formam **dois eixos**:

**Eixo A — Inflação de estatuto epistêmico** (#1, #3, #4, #5):
Componentes afirmam mais certeza do que a informação possui. Decisão vira "fato", interpretação vira "coleta", interpretação vira "conhecimento". É o padrão sistêmico mais forte — aparece em 4 das 7.

**Eixo B — Perda de distinção/proveniência** (#2, #6, #7):
Informações de estatutos diferentes ficam indistinguíveis por falta de metadado (confiança, linhagem, estatuto). O pipeline transporta valores nus.

**Observação de sequência:** o Eixo A é curável ponto-a-ponto (marcar cada informação com seu estatuto real). O Eixo B exige uma mudança de como a informação é representada (carregar metadado). Eixo A é mais urgente e mais localizado; Eixo B é mais fundacional e mais caro.

---

## Ponto de Concentração Recomendado (sem solução)

A evidência aponta que **ProjectLoader concentra 3 das 4 oportunidades de maior impacto** (#1, #2, #3). Não é coincidência: é a fronteira onde o mundo real (heterogêneo, não-Node) encontra um observador Node.js-cêntrico. Todo estatuto epistêmico é definido — ou corrompido — na primeira observação.

Se o próximo ciclo for atacar UMA coisa, a evidência favorece **a fronteira de observação do ProjectLoader** — onde decisão, ausência-de-observação e interpretação estão todas mascaradas de "fato coletado".

Não proponho COMO. Apenas registro ONDE a evidência concentra o impacto.

---

## O Que NÃO Foi Feito

- Nenhuma solução proposta
- Nenhuma refatoração sugerida
- Nenhum código escrito
- Nenhum componente novo
- Apenas avaliação dos componentes existentes contra o modelo, com evidência de output real

---

**Status:** AVALIAÇÃO ARQUITETURAL (critério = modelo epistemológico)
**Oportunidades identificadas:** 7, priorizadas por impacto
**Eixos revelados:** inflação de estatuto (A) + perda de distinção/proveniência (B)
**Concentração de impacto:** fronteira de observação do ProjectLoader (3 das 4 maiores)
**Soluções propostas:** NENHUMA (próximo ciclo)
**Atualizado:** 2026-07-12 03:20
