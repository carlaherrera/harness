# Experimento: Modelo Epistemológico vs. Pipeline Downstream

> Estende a classificação (que testou ProjectLoader) para mais 5 pontos:
> ContextBuilder, DevRole (conventions), DevRole (constraints), RoleOutput/artifacts, MemoryWriter.
>
> Testa se o modelo de 6 estados (Observação/Evidência/Inferência/Interpretação/Decisão/Conhecimento) + proveniência
> permanece consistente ao longo de TODO o pipeline.
>
> Sem alterar arquitetura. Apenas classificar output real.
>
> Data: 2026-07-12
> Método: Hipótese → Experimento → Observação → Comparação
> Continuação de: EXPERIMENT_MODEL_VS_REALITY.md

---

## Hipótese Sob Teste

O modelo (agora 6 estados, após o experimento anterior exigir "Decisão") descreve corretamente as informações produzidas pelos componentes DOWNSTREAM do ProjectLoader.

**Critério de falha:** informação real que não caiba, ou que exija um 7º estado não previsto.

---

## Fonte da Evidência

Run real: `hubdev-pro` (Next.js), objetivo "Improve type safety".

```
Context built:      filesLoaded:4, conventionsDetected:2, constraintsIdentified:2
conventions:        { codeStyle:"TypeScript", namingConvention:"App Router conventions" }
constraints:        ["No test script defined", "No additional relevant files found"]
artifacts:          3 (2 convention + 1 learning)
```

Artifact real em disco (`memory/convention-*.md`):
```
# Convention
Description: Project uses TypeScript for type safety
Context: Detected in package.json and tsconfig.json. Implies strict type checking enabled.
Related Components: ProjectLoader, ContextBuilder
Generated: 2026-07-12T06:14:52.129Z
```

Código de referência: `context-builder.ts`, `dev.ts`, `memory-writer.ts`.

---

## Ponto 1: ContextBuilder — `relevantFiles` (conteúdo lido)

Output real: 4 arquivos lidos (package.json, tsconfig.json, CLAUDE.md, README.md), cada um com `content` preenchido.

| Campo | Valor |
|-------|-------|
| **Estado** | OBSERVAÇÃO |
| **Origem** | `readRelevantFiles`, `fs.readFile` (context-builder.ts linhas 34-61) |
| **Regra** | Nenhuma inferência. Lê o conteúdo literal dos arquivos que ProjectLoader marcou (linha 47) |
| **Confiança** | Máxima. É o byte-a-byte do arquivo. |
| **Linhagem** | ← `metadata.files` (ProjectLoader, já classificado: observação+interpretação) → leitura de conteúdo |

**Coube?** SIM. Ler conteúdo é observação pura. Note: herda a interpretação "relevância" da linhagem (ProjectLoader escolheu QUAIS ler), mas o ato de ler é observação. O modelo separa: seleção=interpretação (a montante), leitura=observação (aqui). Consistente com Ponto 10 do experimento anterior.

---

## Ponto 2: ContextBuilder — `conventions.codeStyle: "TypeScript"`

Output real: `{ codeStyle: "TypeScript" }`.

| Campo | Valor |
|-------|-------|
| **Estado** | INFERÊNCIA |
| **Origem** | `detectConventions` (context-builder.ts linhas 63-118) |
| **Regra** | "se technologies inclui 'TypeScript' ⇒ codeStyle='TypeScript'" (linha 70) |
| **Confiança** | Média-alta. Mas depende de `technologies` (que já era inferência do ProjectLoader). |
| **Linhagem** | ← `metadata.technologies` (INFERÊNCIA #5 do exp. anterior) → regra tech⇒convention. **Profundidade 2.** |

**Coube?** SIM. Inferência sobre inferência (como mainFramework). "codeStyle é TypeScript" excede o observado — ninguém observou um estilo de código; inferiu-se de uma tecnologia que também foi inferida. Modelo captura via linhagem profunda.

---

## Ponto 3: ContextBuilder — `conventions.namingConvention: "App Router conventions"`

Output real: `{ namingConvention: "App Router conventions" }`.

| Campo | Valor |
|-------|-------|
| **Estado** | INFERÊNCIA (com salto MAIOR que #2) |
| **Origem** | `detectConventions` (linha 78): "se technologies inclui 'Next.js' ⇒ namingConvention='App Router conventions'" |
| **Regra** | Next.js ⇒ "App Router conventions" |
| **Confiança** | BAIXA. ★ Salto questionável. |
| **Linhagem** | ← technologies inclui Next.js (inferência) → regra |

**Coube?** SIM, mas revela GRADAÇÃO DE CONFIANÇA dentro do mesmo estado. ★ Achado:

Next.js **não implica** App Router. Next.js tem dois roteadores (App Router e Pages Router). A regra afirma "App Router" sem observar qual está em uso. É inferência com salto **inválido no caso geral** — confiança baixa, mas o output a apresenta idêntica a `codeStyle:TypeScript` (que é sólida).

O modelo epistemológico **prevê grau de confiança** como atributo da inferência. Aqui o output real produz duas inferências de confiança MUITO diferente (TypeScript: alta; App Router: baixa/errada) apresentadas com forma idêntica. Modelo distingue; código não marca. Consistente com o padrão "código colapsa distinções que o modelo faz".

---

## Ponto 4: DevRole — `constraints: ["No test script defined", ...]`

Output real: `["No test script defined", "No additional relevant files found"]`.

| Campo | Valor |
|-------|-------|
| **Estado** | INTERPRETAÇÃO |
| **Origem** | `identifyConstraints` (context-builder.ts linhas 120-144 — nota: no pipeline real ainda está em ContextBuilder) |
| **Regra** | "se !scripts.test ⇒ push 'No test script defined'" (linha 127) |
| **Confiança** | Depende do propósito. "Falta test script" é problema SÓ sob a intenção "código deve ter testes npm". |
| **Linhagem** | ← observação "scripts não tem chave 'test'" + NORMA implícita "deve ter test script" |

**Coube?** SIM, e é o exemplo mais limpo de INTERPRETAÇÃO no pipeline. "Não há test script" é observação de ausência; "isto é uma CONSTRAINT (um problema)" adiciona juízo de valor sob um propósito. Dois projetos idênticos com propósitos diferentes gerariam constraints diferentes. Modelo classifica corretamente como interpretação.

★ Nota de proveniência: a NORMA ("deve ter testes") não está em lugar nenhum rastreável — é embutida no código. O modelo pede linhagem; aqui a premissa normativa é invisível. Mesma classe de problema do default npm: uma política sem marca.

---

## Ponto 5: RoleOutput — `artifact: "Project uses TypeScript for type safety"`

Output real em disco:
```
Description: Project uses TypeScript for type safety
Context: Detected in package.json and tsconfig.json. Implies strict type checking enabled.
```

| Campo | Valor |
|-------|-------|
| **Estado** | INTERPRETAÇÃO destilada — candidata a CONHECIMENTO (mas não chega lá) |
| **Origem** | `dev.ts` (linhas 39-46): "se technologies inclui TypeScript ⇒ push artifact" |
| **Regra** | tech TypeScript ⇒ artifact "usa TypeScript for type safety" |
| **Confiança** | A afirmação factual (usa TS) é alta. O "for type safety" e "implies strict type checking" são INTERPRETAÇÃO adicionada (o porquê). |
| **Linhagem** | ← technologies (inferência) → interpretação de propósito ("for type safety") |

**Coube?** SIM, e testa a fronteira Interpretação↔Conhecimento. ★ Achado central deste experimento:

O artifact tem forma de conhecimento (é o que se persiste, chama-se "knowledge artifact"). Mas pelo critério do modelo (STATES_OF_INFORMATION: conhecimento = interpretação **validada** que **reorienta ação futura**):

- **Validado?** Não. Ninguém confirmou.
- **Reorienta ação futura?** Não. Nada relê o artifact (MemoryWriter escreve, nenhum componente carrega de volta — Hipótese Oculta nº 5).

**Portanto o artifact é INTERPRETAÇÃO PERSISTIDA, não CONHECIMENTO.** O modelo classifica corretamente e expõe que o nome "KnowledgeArtifact" infla o estatuto — mesmo erro semântico de "fato", num ponto diferente do pipeline. Consistência do modelo: ele detecta a mesma patologia (inflação de estatuto) em dois lugares distintos.

---

## Ponto 6 (bônus): MemoryWriter — o ato de persistir

Output real: arquivo `.md` escrito em disco com timestamp.

| Campo | Valor |
|-------|-------|
| **Estado** | Nenhum dos 6 — é uma TRANSFORMAÇÃO (inscrição), não um estado de informação |
| **Origem** | `memory-writer.ts` `write` (linhas 13-43), `fs.writeFile` |
| **Regra** | Formata artifact como markdown (linha 45-60) + timestamp |
| **Confiança** | N/A — não produz afirmação, transporta uma para disco |
| **Linhagem** | ← artifact recebido (interpretação). Não adiciona nem transforma o estatuto. |

**Coube?** SIM, por exclusão reveladora. MemoryWriter **não produz informação nova** — inscreve a existente. É a última seta da cadeia (inscrição), não um estado. 

★ Achado: o `timestamp` que MemoryWriter adiciona (`Generated: 2026-...`) é a ÚNICA informação nova, e é OBSERVAÇÃO (leu o relógio). Curiosamente é o único fragmento de proveniência real que o sistema registra hoje — quando algo foi escrito. Mas não registra de-on-veio, só quando-foi-inscrito. Proveniência temporal existe; proveniência de linhagem não.

---

## Tabela-Síntese (Downstream)

| Ponto | Informação | Estado | Coube? | Nota |
|-------|-----------|--------|--------|------|
| 1 | relevantFiles (conteúdo) | Observação | ✓ | herda relevância da linhagem |
| 2 | conventions.codeStyle | Inferência² | ✓ | profundidade 2 |
| 3 | conventions.namingConvention | Inferência (confiança baixa) | ✓ | salto inválido (App Router) |
| 4 | constraints | Interpretação | ✓ | norma invisível na proveniência |
| 5 | artifact | Interpretação persistida (NÃO conhecimento) | ✓ | nome infla estatuto |
| 6 | MemoryWriter (persistir) | Transformação, não estado | ✓ | só timestamp é info nova (observação) |

---

## Resultado: Modelo Continua Consistente?

### SIM. Os 6 estados descreveram todos os 6 pontos downstream sem exigir um 7º.

**Zero casos precisaram de estado novo.** O experimento anterior já havia forçado a adição de "Decisão" (5→6 estados). Nos pontos downstream, os 6 bastaram. Isto é evidência de estabilidade: o modelo se completou no ProjectLoader e não quebrou mais.

### Padrões confirmados ao longo de TODO o pipeline

1. **Linhagem tem profundidade crescente rio abaixo.** ProjectLoader: profundidade 1-2. ContextBuilder conventions: profundidade 2. Artifact: profundidade 3 (technologies←package.json, depois convention←technologies, depois artifact←convention). A proveniência é rastreável mas cada vez mais funda. Modelo aguenta.

2. **"Inflação de estatuto epistêmico" aparece em MÚLTIPLOS pontos:**
   - ProjectLoader: inferências e decisão chamadas de "fato"
   - DevRole: interpretação (constraint) que embute norma invisível
   - RoleOutput: interpretação chamada de "Knowledge"
   
   O modelo detecta a MESMA patologia em 3 lugares distintos. Consistência forte: não é achado isolado do ProjectLoader, é padrão sistêmico.

3. **"Código colapsa distinções que o modelo faz"** — confirmado downstream:
   - Ponto 3: inferência forte (TypeScript) e fraca (App Router) têm forma idêntica no output.
   - Igual ao array vazio ambíguo do experimento anterior. Padrão consistente.

4. **Confiança é atributo real e variável DENTRO de um estado** (Ponto 3): duas inferências, confianças opostas. O modelo previu confiança como dimensão; a realidade produziu o caso.

### Onde o modelo se mostrou MAIS forte que antes

O Ponto 5 (artifact) testou a fronteira Interpretação↔Conhecimento — a transição mais sutil da cadeia. O modelo **cortou corretamente**: artifact não é conhecimento porque não fecha ciclo. Isto valida a definição estrita de conhecimento (STATES_OF_INFORMATION) contra um caso real que o sistema chama de "knowledge".

---

## Comparação com a Hipótese

**Hipótese:** o modelo descreve corretamente o pipeline downstream.

**Resultado:** 6/6 pontos classificados sem exigir estado novo. Padrões do experimento anterior (linhagem, inflação de estatuto, colapso de distinções) **reaparecem consistentemente** rio abaixo. A fronteira Interpretação↔Conhecimento foi testada e o modelo cortou certo.

**Veredito:** o modelo de 6 estados + proveniência é **consistente ao longo de todo o pipeline** (ProjectLoader → ContextBuilder → DevRole → RoleOutput → MemoryWriter). 

Duas execuções de classificação (ProjectLoader + downstream) cobriram 16 informações reais. Estados usados: Observação, Inferência, Interpretação, Decisão. Não usados ainda em nenhum output real: **Evidência** (pura, isolada) e **Conhecimento** (nada fecha ciclo). 

★ Achado meta: dois dos seis estados (Evidência isolada, Conhecimento) **nunca foram materializados** pelo Harness real. Evidência sempre aparece já-virada-inferência; Conhecimento nunca é alcançado porque nada relê. Isto não refuta o modelo — descreve com precisão o que o Harness atual É: um sistema que salta de observação direto a inferência (pula evidência explícita) e que nunca fecha o ciclo de conhecimento.

---

## O Que NÃO Foi Feito

- Arquitetura NÃO alterada
- Contratos NÃO modificados
- Classes NÃO renomeadas
- Nenhum componente novo
- Nenhuma teoria nova — só classificação de output real de 6 pontos

---

**Status:** EXPERIMENTO PRÁTICO (downstream)
**Modelo consistente ao longo do pipeline:** SIM (16 informações, 0 exigiram 7º estado)
**Estados materializados pelo Harness real:** Observação, Inferência, Interpretação, Decisão
**Estados NUNCA materializados:** Evidência isolada, Conhecimento (nada fecha ciclo)
**Achado principal:** artifact chamado "Knowledge" é interpretação persistida — modelo corta a fronteira corretamente
**Padrão sistêmico confirmado:** inflação de estatuto epistêmico em 3 pontos distintos
**Decisões arquiteturais:** NENHUMA
**Atualizado:** 2026-07-12 03:16
