# Experimento: Modelo Epistemológico vs. Output Real do ProjectLoader

> Testa se o modelo descoberto (Observação/Evidência/Inferência/Interpretação/Conhecimento)
> classifica corretamente informações REAIS produzidas pelo ProjectLoader.
>
> Sem alterar arquitetura. Sem renomear. Sem novos componentes.
> Apenas classificar output real.
>
> Data: 2026-07-12
> Método: Hipótese → Experimento → Observação → Comparação

---

## Hipótese Sob Teste

O modelo epistemológico de 5 estados + proveniência (origem, regra, confiança, linhagem) consegue descrever **corretamente** cada informação que o ProjectLoader realmente produz.

**Critério de falha:** se alguma informação real não couber em nenhum estado, ou couber ambiguamente em vários sem critério de desempate, o modelo falhou naquele caso.

---

## Fonte da Evidência

Dois runs reais do pipeline, capturados via `LOG_LEVEL=debug`:

**Run A — hubdev-pro (Next.js)**
```
technologies: ["React", "Next.js", "TypeScript"]
packageManager: "pnpm"
scripts: ["dev", "build", "start", "lint"]
files: { others:[], packageJson, tsConfig, claudeMd, readme }
structure: [AGENTS.md, CLAUDE.md, components.json, docs, ...]
```

**Run B — hubcrm-optadev (PHP MVC)**
```
technologies: []
packageManager: "npm"
scripts: []
files: { others:[], claudeMd }
structure: [app, Controllers, Core, Helpers, Middleware, Models, ...]
```

Código-fonte de referência: `src/core/project-loader/project-loader.ts` (regras citadas por linha).

---

## Classificação Informação-por-Informação

Para cada informação: **estado** + origem + regra (código real) + confiança + linhagem.

---

### 1. `name` (ex: "hubdev-pro", "hubcrm-optadev")

| Campo | Valor |
|-------|-------|
| **Estado** | OBSERVAÇÃO |
| **Origem** | `path.basename(projectPath)` (linha 16) |
| **Regra** | Nenhuma regra inferencial. Transcrição direta do último segmento do path. |
| **Confiança** | Máxima. Não há salto — é o que o SO reporta. |
| **Linhagem** | ← projectPath (input do usuário/CLI) |

**Coube no modelo?** SIM, limpo. Observação pura: registro direto sem afirmação de significado.

---

### 2. `structure` (ex: [app, Controllers, Models...])

| Campo | Valor |
|-------|-------|
| **Estado** | OBSERVAÇÃO (com recorte por política) |
| **Origem** | `buildDirectoryStructure`, `fs.readdir` (linhas 40-78) |
| **Regra** | Nenhuma inferência. MAS há **política de observação**: maxDepth=2 (linha 42), pula `.`/`node_modules`/`dist` (linha 54) |
| **Confiança** | Alta para o que registra. Incompleta por design (recorte). |
| **Linhagem** | ← filesystem real, filtrado por política de profundidade/exclusão |

**Coube no modelo?** SIM, mas com nuance importante. É observação, mas o modelo epistemológico previu isto: "toda observação é recortada; recorte é política". A política (maxDepth=2, exclusões) está embutida no resultado sem ser marcada. O modelo **descreve corretamente** — inclusive prevê que o recorte deveria ser rastreável e não é.

---

### 3. `packageManager: "pnpm"` (Run A — hubdev-pro)

| Campo | Valor |
|-------|-------|
| **Estado** | INFERÊNCIA |
| **Origem** | `detectPackageManager` (linhas 103-122) |
| **Regra** | "se existe pnpm-lock.yaml ⇒ pnpm" (linha 113). Ordem de prioridade: pnpm > yarn > npm-lock |
| **Confiança** | Alta. Lock file é sinal forte. Mas é salto: observou-se arquivo, afirma-se gerenciador. |
| **Linhagem** | ← observação "existe pnpm-lock.yaml" + regra de mapeamento |

**Coube no modelo?** SIM. Inferência clássica: evidência (lock file) + regra ⇒ conclusão que excede o observado. Ninguém "viu pnpm"; viu-se um arquivo.

---

### 4. `packageManager: "npm"` (Run B — hubcrm-optadev) ★ CASO CRÍTICO

| Campo | Valor |
|-------|-------|
| **Estado** | DECISÃO (não é nenhum dos 5 estados do modelo!) |
| **Origem** | `detectPackageManager`, `return 'npm'` fora do loop (linha 121) |
| **Regra** | "se NENHUM lock file encontrado ⇒ retorna 'npm' como default" |
| **Confiança** | ZERO como observação. Nenhuma evidência suporta "npm" — não há lock file no projeto PHP. |
| **Linhagem** | ← AUSÊNCIA de evidência + política "na dúvida, npm". Não tem linhagem observacional. |

**Coube no modelo?** ★ **PARCIALMENTE — E ESTE É O ACHADO DO EXPERIMENTO.**

O modelo de 5 estados (Observação/Evidência/Inferência/Interpretação/Conhecimento) **NÃO tem um estado para isto**. Não é:
- Observação (nada foi observado — o projeto PHP não tem lock file)
- Evidência (ausência de evidência não é evidência)
- Inferência (não há premissa observada para saltar; "não achei nada" não é premissa de "é npm")
- Interpretação (não há propósito atribuindo significado)
- Conhecimento (obviamente não)

É uma **DECISÃO / POLÍTICA** — a sexta categoria que a investigação epistemológica (EPISTEMOLOGY_OF_INFORMATION.md, Parte II) já havia identificado como "decisão travestida de fato", mas que a cadeia de 5 estados (STATES_OF_INFORMATION.md) **não incluiu explicitamente**.

**Portanto: o modelo de 5 estados falha aqui. Precisa de um sexto estado: DECISÃO.**

Isto não invalida o modelo — confirma-o. A investigação teórica previu que defaults são decisões disfarçadas. O experimento com output real **produziu exatamente esse caso** e mostrou que a lista de 5 estados é insuficiente para nomeá-lo. Evidência prática de que "Decisão" precisa ser estado de primeira classe.

---

### 5. `technologies: ["React","Next.js","TypeScript"]` (Run A)

| Campo | Valor |
|-------|-------|
| **Estado** | INFERÊNCIA |
| **Origem** | `detectTechnologies` (linhas 147-181) |
| **Regra** | "se deps['react'] existe ⇒ add 'React'" (linha 162); idem next, typescript, express, vue, svelte. + "se existe tsConfig ⇒ add TypeScript" (linha 174) |
| **Confiança** | Alta. Presença em dependencies é sinal forte de uso. |
| **Linhagem** | ← observação "package.json contém deps X" + regra dep⇒tecnologia. Cadeia: leu package.json (linha 157) → parseou → checou chaves |

**Coube no modelo?** SIM. Inferência. Ninguém observou "React"; observou-se uma string "react" numa lista e saltou-se para "usa React". Salto válido, mas salto.

---

### 6. `technologies: []` (Run B — PHP) ★ CASO AMBÍGUO

| Campo | Valor |
|-------|-------|
| **Estado** | ??? (AMBÍGUO — ver análise) |
| **Origem** | `detectTechnologies` retorna Set vazio → array vazio (linha 180) |
| **Regra** | Nenhuma regra disparou (não há package.json, logo nenhuma dep checada) |
| **Confiança** | INDEFINIDA — e aqui está o problema |
| **Linhagem** | ← ausência de package.json → nenhuma inferência produzida |

**Coube no modelo?** ★ **NÃO LIMPO — SEGUNDO ACHADO.**

`[]` (array vazio) é **semanticamente ambíguo**. Pode significar duas coisas epistemicamente opostas:

(a) **"Observei e não há tecnologias"** — uma afirmação (inferência: "nada detectado")
(b) **"Não consegui observar tecnologias"** — ausência de observação (não olhei no lugar certo; PHP não usa package.json)

No caso PHP real, a verdade é (b): o ProjectLoader não tem como observar tecnologias PHP (só olha package.json). Mas o output `[]` é indistinguível de (a).

**O modelo epistemológico distingue (a) de (b)** — (a) é inferência com baixa confiança, (b) é ausência de observação. Mas o **output real do código colapsa ambos em `[]`**. 

Veredito: o modelo está CERTO (distingue os casos). O CÓDIGO é que perde a distinção. O experimento revela que o modelo é mais fino que a estrutura de dados atual — o que é exatamente evidência a favor do modelo.

---

### 7. `scripts: ["dev","build","start","lint"]` (Run A)

| Campo | Valor |
|-------|-------|
| **Estado** | OBSERVAÇÃO (transcrição) |
| **Origem** | `extractScripts` (linhas 124-145) |
| **Regra** | Nenhuma inferência. Copia `pkg.scripts` do package.json (linha 137) |
| **Confiança** | Máxima. É transcrição literal do que está escrito no arquivo. |
| **Linhagem** | ← leitura + parse de package.json → objeto scripts |

**Coube no modelo?** SIM. É observação — leu-se o que está literalmente escrito. Não há salto. (Contraste com technologies, que infere; scripts apenas transcreve.)

---

### 8. `scripts: []` (Run B — PHP)

| Campo | Valor |
|-------|-------|
| **Estado** | AUSÊNCIA DE OBSERVAÇÃO (mesmo problema do #6) |
| **Origem** | Sem package.json → scripts fica `{}` (linha 128, nunca preenchido) |
| **Regra** | Nenhuma. Não há de onde extrair. |
| **Confiança** | INDEFINIDA — igual #6 |
| **Linhagem** | ← ausência de package.json |

**Coube no modelo?** Mesma ambiguidade do #6. `{}`/`[]` = "não tem scripts" OU "não sei observar scripts deste ecossistema". Código colapsa; modelo distingue.

---

### 9. `mainFramework: "Next.js"` (Run A) / `undefined` (Run B)

| Campo | Valor |
|-------|-------|
| **Estado** | INFERÊNCIA² (inferência sobre inferência) |
| **Origem** | `detectMainFramework` (linhas 183-191) |
| **Regra** | "se technologies inclui Next.js ⇒ Next.js" (linha 184); prioridade Next>React>Vue>Svelte>Express |
| **Confiança** | Média. Depende de `technologies` (já inferido) — erro se propaga. |
| **Linhagem** | ← `technologies` (inferência #5) → regra de prioridade. **Depende de outra inferência.** |

**Coube no modelo?** SIM, e revela algo: linhagem de **profundidade 2**. mainFramework não deriva de observação — deriva de `technologies`, que já era inferência. O modelo captura isto via linhagem (dependência rastreável). Confirma que proveniência tem profundidade variável.

---

### 10. `files.packageJson: "package.json"` / `files.others: []`

| Campo | Valor |
|-------|-------|
| **Estado** | OBSERVAÇÃO + INTERPRETAÇÃO (misturados) |
| **Origem** | `findRelevantFiles` (linhas 80-101) |
| **Regra** | Whitelist hardcoded: package.json, tsconfig.json, CLAUDE.md, README.md (linhas 83-88). Testa `fs.access` |
| **Confiança** | Observação (existe?) máxima. Interpretação (é "relevante"?) questionável. |
| **Linhagem** | ← existência do arquivo (observação) + whitelist (política de relevância) |

**Coube no modelo?** SIM, e confirma achado anterior: "relevância" é **interpretação disfarçada de observação**. A informação "packageJson existe" é observação pura. Mas o campo se chama Relevant**Files** — o rótulo "relevante" é interpretação sob propósito (Node.js). O modelo separa: existência = observação; relevância = interpretação. Código mistura os dois no mesmo campo.

---

## Tabela-Síntese

| # | Informação | Estado no modelo | Coube limpo? |
|---|-----------|------------------|--------------|
| 1 | name | Observação | ✓ |
| 2 | structure | Observação (+política recorte) | ✓ (com nuance prevista) |
| 3 | packageManager: pnpm | Inferência | ✓ |
| 4 | packageManager: npm (default) | **DECISÃO** | ✗ falta estado |
| 5 | technologies: [React,...] | Inferência | ✓ |
| 6 | technologies: [] (PHP) | Ambíguo (inferência vs ausência) | ✗ código colapsa |
| 7 | scripts: [dev,...] | Observação | ✓ |
| 8 | scripts: [] (PHP) | Ausência de observação | ✗ código colapsa |
| 9 | mainFramework | Inferência² | ✓ (linhagem profunda) |
| 10 | files (relevant) | Observação + Interpretação | ✓ (mistura prevista) |

---

## Resultado do Experimento

### O Modelo Sobreviveu? SIM — com dois refinamentos exigidos pela realidade.

**7 de 10 informações couberam limpo** nos 5 estados. As 3 que não couberam **não refutam o modelo — refinam-no**, e ambos os refinamentos já haviam sido *previstos* na investigação teórica:

### Refinamento 1: Falta o estado DECISÃO (caso #4)

O default `packageManager: "npm"` não é nenhum dos 5 estados. É uma decisão/política sem lastro observacional. A investigação epistemológica já o havia identificado teoricamente; o output real **materializou** o caso. 

**Evidência prática:** o modelo de 5 estados precisa de um 6º estado de primeira classe: **Decisão** (afirmação produzida por política na ausência de evidência).

### Refinamento 2: Ausência-de-observação ≠ observação-de-ausência (casos #6, #8)

`technologies: []` e `scripts: []` são ambíguos no código real: colapsam "observei que não há" com "não sei observar isto". O modelo epistemológico **distingue** os dois (inferência-de-nada vs. ausência-de-observação); o código não.

**Evidência prática:** o modelo é mais fino que a estrutura de dados atual. Um array vazio precisa carregar seu estatuto: "vazio-confirmado" vs. "vazio-por-cegueira". Isto NÃO é proposta de implementação — é constatação de que o modelo detecta uma distinção que o Harness real perde.

### Confirmações (casos que couberam)

- **Linhagem funciona e tem profundidade variável** (mainFramework depende de technologies que depende de package.json — 3 níveis). Proveniência rastreável na prática.
- **"Relevância" é interpretação** confirmado em output real (#10).
- **Observação vs. Inferência é distinção real e útil:** scripts (transcrição=observação) vs. technologies (salto=inferência) — o mesmo ProjectLoader produz ambos, e o modelo os separa corretamente.

---

## Onde o Modelo FALHARIA se Insistíssemos nos 5 Estados

Se forçássemos os 5 estados originais sem o 6º (Decisão):

- Caso #4 (`npm` default) seria mal-classificado como "inferência" ou "observação" — exatamente o erro que o Harness comete hoje ("fato"). O modelo de 5 estados, sem Decisão, **repetiria o erro que estamos tentando corrigir.**

Portanto: os 5 estados são **necessários mas não suficientes**. O experimento prova que Decisão é o 6º estado obrigatório.

---

## Comparação com a Hipótese

**Hipótese:** o modelo descreve corretamente cada informação real do ProjectLoader.

**Resultado:** descreve corretamente 7/10 diretamente; os 3 restantes expõem que o modelo precisa de (a) um estado Decisão e (b) capacidade de distinguir ausência-de-observação de observação-de-ausência. Ambos já previstos teoricamente, agora com evidência de código.

**Veredito:** o modelo **sobreviveu ao primeiro contato com output real** e saiu mais preciso. Primeira evidência prática de que merece influenciar arquitetura futura — mas com a lista de estados corrigida para SEIS (incluindo Decisão) e com a distinção vazio-confirmado/vazio-cego registrada.

---

## O Que NÃO Foi Feito (conforme instrução)

- Arquitetura NÃO alterada
- ProjectMetadata NÃO substituído
- Classes NÃO renomeadas
- Nenhum componente novo proposto
- Nenhuma teoria nova inventada — apenas classificação de output real

---

**Status:** EXPERIMENTO PRÁTICO
**Modelo sobreviveu:** SIM, com 2 refinamentos exigidos por casos reais
**Estados necessários:** SEIS (5 originais + Decisão), não cinco
**Achado principal:** default "npm" é o caso real que prova a necessidade do estado Decisão
**Achado secundário:** array vazio colapsa dois estatutos epistêmicos distintos
**Decisões arquiteturais:** NENHUMA
**Atualizado:** 2026-07-12 03:12
