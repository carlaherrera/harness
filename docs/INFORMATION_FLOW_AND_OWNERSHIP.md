# Mapa: Origem e Responsabilidade de Cada Informação no Pipeline

> Rastreamento de fluxo de informação através do pipeline.
> Identifica: onde nasce, se é fato ou interpretação, proprietário legítimo, transportadores.
>
> Data: 2026-07-12
> Status: OBSERVAÇÃO (análise do que existe, não do que deveria existir)

---

## Pipeline Completo

```
ProjectLoader → ProjectMetadata
     ↓
ContextBuilder → Context
     ↓
RoleRunner → DevRole → RoleOutput
     ↓
MemoryWriter → Artifacts (em disk)
```

---

## Rastreamento: ProjectMetadata

### Campo: `path`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (argumento `load(projectPath)`) |
| **Tipo** | FATO (observado: o caminho passado ao loader) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | ContextBuilder (readRelevantFiles), DevRole (logging) |
| **Quem produz errado** | Ninguém |

**Observação:** Transportado mas raramente usado depois de ProjectLoader.

---

### Campo: `name`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (derivado de `path.basename(projectPath)`) |
| **Tipo** | FATO (observado: nome do diretório) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context → RoleOutput |
| **Consumido por** | DevRole (logging), Artifacts (projectName) |
| **Quem produz errado** | Ninguém |

**Observação:** Legitimamente transportado, constantemente usado.

---

### Campo: `structure`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (buildDirectoryStructure, filesystem scan) |
| **Tipo** | FATO (observado: estrutura de diretórios) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | Ninguém (em pipeline atual) |
| **Quem produz errado** | Ninguém (está correto) |

**Observação:** Informação válida, mas não consumida. Pode ser útil pra futuros Roles (Architect).

---

### Campo: `files` (RelevantFiles)

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (findRelevantFiles) |
| **Tipo** | FATO (observado: quais arquivos relevantes existem) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | ContextBuilder (readRelevantFiles), DevRole (logging) |
| **Quem produz errado** | ProjectLoader (hardcoded whitelist: package.json, tsconfig, etc.) |

**Problema identificado:** RelevantFiles é hardcoded para Node.js. Em PHP, `composer.json` não é detectado como relevant.

---

### Campo: `technologies`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (detectTechnologies) |
| **Tipo** | FATO tentativa + FALHA em não-Node.js |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | ContextBuilder (detectConventions), DevRole (artifact generation) |
| **Quem produz errado** | ProjectLoader (assume npm packages como universal) |

**Problema identificado:** Em HubCRM/WordPress (PHP), retorna `[]`. Tecnicamente correto (não detectou), mas não comunica "tentei mas falhi" vs. "não há tecnologias".

---

### Campo: `packageManager`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (detectPackageManager) |
| **Tipo** | FATO tentativa + DEFAULT INCORRETO |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | DevRole (artifact: pnpm convention) |
| **Quem produz errado** | ProjectLoader (retorna "npm" como fallback quando não encontra) |

**Problema identificado:** HubCRM (PHP) retorna "npm" (incorrect default). WordPress retorna "npm" (ignora composer).

---

### Campo: `scripts`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (extractScripts) |
| **Tipo** | FATO (lê package.json se existe) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | DevRole (constraint identification) |
| **Quem produz errado** | ProjectLoader (assume npm scripts exist) |

**Problema identificado:** Em HubCRM (PHP), retorna `{}` (empty). Tecnicamente correto, mas DevRole interpreta como "constraint: no scripts".

---

### Campo: `mainFramework`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader (detectMainFramework) |
| **Tipo** | FATO tentativa (mapeamento de technologies) |
| **Proprietário legítimo** | ProjectLoader |
| **Transporta até** | ContextBuilder → Context |
| **Consumido por** | Ninguém (em pipeline atual) |
| **Quem produz errado** | ProjectLoader (hardcoded mapping: Next.js, React, etc.) |

**Observação:** Não consumido hoje. Pode ser útil pra Architect Role.

---

## Rastreamento: Context

### Campo: `objective`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | CLI (argumento `-o`) → WorkflowEngine → ContextBuilder |
| **Tipo** | FATO (intenção do usuário) |
| **Proprietário legítimo** | WorkflowEngine |
| **Transporta até** | Context → DevRole |
| **Consumido por** | DevRole (logging apenas) |
| **Quem produz errado** | Ninguém |

**Observação:** Essencial, transportado corretamente.

---

### Campo: `project` (ProjectMetadata)

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ProjectLoader |
| **Tipo** | FATO (coleta ProjectMetadata) |
| **Proprietário legítimo** | ProjectLoader (proprietário), ContextBuilder (transportador) |
| **Transporta até** | Context → RoleOutput |
| **Consumido por** | DevRole, futuros Roles |
| **Quem produz errado** | ProjectLoader (problemas em fields específicos) |

---

### Campo: `technologies` (alias)

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ContextBuilder (copia de `project.technologies`) |
| **Tipo** | REDUNDÂNCIA (não adiciona valor) |
| **Proprietário legítimo** | Ninguém (é alias) |
| **Transporta até** | Context → DevRole |
| **Consumido por** | DevRole |
| **Quem produz errado** | ContextBuilder (desnecessariamente duplica) |

**Problema identificado:** Campo `technologies` duplica `project.technologies`. Ambos acessam a mesma informação.

---

### Campo: `relevantFiles`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ContextBuilder (readRelevantFiles, lê arquivo content) |
| **Tipo** | FATO (conteúdo de arquivos) |
| **Proprietário legítimo** | ContextBuilder (quem lê os arquivos) |
| **Transporta até** | Context → DevRole |
| **Consumido por** | DevRole (logging, busca CLAUDE.md/package.json) |
| **Quem produz errado** | ContextBuilder (apenas lê o que ProjectLoader indicou como "relevant") |

**Observação:** Correto. RelevantFiles dependem de ProjectLoader indicar quais são relevantes.

---

### Campo: `constraints`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ContextBuilder (identifyConstraints, INTERPRETAÇÃO) |
| **Tipo** | INTERPRETAÇÃO (não é fato, é julgamento) |
| **Proprietário legítimo** | INCORRETO (deveria ser DevRole) |
| **Transporta até** | Context → DevRole (consome o que ContextBuilder gerou!) |
| **Consumido por** | DevRole (passa para artifacts) |
| **Quem produz errado** | ContextBuilder (AQUI está o erro) |

**Problema identificado:** ContextBuilder gera constraints (interpretação), depois DevRole consome e re-transporta. Violação da ADR aceita.

**Nota:** Experimento anterior mostrou que DevRole consegue gerar constraints equivalentes. Então constraints NÃO deveriam estar em ContextBuilder.

---

### Campo: `conventions`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ContextBuilder (detectConventions, INTERPRETAÇÃO) |
| **Tipo** | INTERPRETAÇÃO (não é fato, é análise) |
| **Proprietário legítimo** | INCORRETO (deveria ser DevRole) |
| **Transporta até** | Context → DevRole (consome o que ContextBuilder gerou!) |
| **Consumido por** | DevRole (passa para artifacts) |
| **Quem produz errado** | ContextBuilder (AQUI está o erro) |

**Problema identificado:** ContextBuilder gera conventions (interpretação), depois DevRole consome. Viola ADR.

**Nota:** Experimento anterior mostrou equivalência. Conventions NÃO deveriam estar em ContextBuilder.

---

### Campo: `currentTask`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | ContextBuilder (copia `objective`) |
| **Tipo** | REDUNDÂNCIA (duplica objetivo) |
| **Proprietário legítimo** | Ninguém (é alias) |
| **Transporta até** | Context → (não é consumido) |
| **Consumido por** | Ninguém |
| **Quem produz errado** | ContextBuilder (cria desnecessariamente) |

**Problema identificado:** Campo nunca consumido. Redun dante com `objective`.

---

## Rastreamento: RoleOutput

### Campo: `artifacts`

| Aspecto | Valor |
|---------|-------|
| **Onde nasce** | DevRole (extrai conhecimento do Context) |
| **Tipo** | INTERPRETAÇÃO (extração de padrões) |
| **Proprietário legítimo** | DevRole |
| **Transporta até** | WorkflowEngine → MemoryWriter |
| **Consumido por** | MemoryWriter (persiste) |
| **Quem produz errado** | Ninguém (correto) |

**Observação:** Fluxo correto. DevRole extrai, MemoryWriter persiste.

---

## Resumo de Problemas Identificados

### Problema 1: ContextBuilder Produz Interpretação

**Informações:** `constraints`, `conventions`

**Proprietário legítimo:** DevRole

**Evidência:** Experimento anterior mostrou DevRole consegue gerar equivalente.

**Impacto:** Viola ADR-CONTEXT-RESPONSIBILITY.

**Status:** Conhecido (ADR-CONTEXT-RESPONSIBILITY já registra isso).

---

### Problema 2: Redundância em Context

**Informações:** `technologies` (alias), `currentTask` (alias de objective)

**Proprietário legítimo:** Remover (são cópias)

**Evidência:** Nunca consumidos como alias (sempre acessam via `project.*` ou `objective`).

**Impacto:** Incha Context, confunde consumidor.

**Status:** Novo achado.

---

### Problema 3: ProjectLoader Assume Node.js

**Informações:** `packageManager` (default "npm"), `technologies` (vazio em PHP), `files` (hardcoded whitelist)

**Proprietário legítimo:** ProjectLoader (correto), mas lógica é Node.js-centric

**Evidência:** HubCRM/WordPress retornam valores incorretos/incompletos.

**Impacto:** Cascata de problemas downstream (DevRole cria constraints incorretas).

**Status:** Conhecido (documentado em EXPERIMENTS.md).

---

### Problema 4: DevRole Consome Interpretação de ContextBuilder

**Informações:** `constraints`, `conventions` (gerados por ContextBuilder, consumidos por DevRole)

**Proprietário legítimo:** Ninguém (fluxo circular incorreto)

**Evidência:** ContextBuilder gera, DevRole consome e re-gera/re-emite.

**Impacto:** Violação de responsabilidade única.

**Status:** Novo achado (cascata de Problema 1).

---

### Achado 5: Informação Não Consumida

**Informações:** `project.structure` (nunca lido por DevRole)

**Proprietário legítimo:** ProjectLoader (correto), mas não consumido

**Evidência:** DevRole não usa structure.

**Impacto:** Transportada inutilmente (ou será necessária pra Architect).

**Status:** Esperado (pode ser útil pra futuros Roles).

---

## Conclusões de Fluxo (Sem Decisão Arquitetural)

### O que Funciona Corretamente

1. `path`, `name` — fatos, proprietários claros, transportados legitimamente
2. `technologies`, `scripts`, `packageManager` — fatos (com caveat em Node.js-centrismo)
3. `objective` — fato, transportado corretamente
4. `relevantFiles` — fato, leitura legítima de ContextBuilder
5. `artifacts` — interpretação, DevRole é proprietário, MemoryWriter persiste corretamente

### O que Está Errado

1. **ContextBuilder gera interpretação** (`constraints`, `conventions`) que deveria gerar DevRole
2. **Redundância desnecessária** (`technologies` alias, `currentTask`)
3. **ProjectLoader assume Node.js** (default "npm", whitelist hardcoded)
4. **Fluxo circular** (ContextBuilder gera → DevRole consome → DevRole re-gera)

### O que é Improviso Que Pode Virar Padrão

1. `project.structure` — não consumido hoje, mas pode ser essencial pra Architect
2. `project.mainFramework` — não consumido hoje, pode ser útil pra Documentation
3. `project.path` — transportado, raramente usado, pode ser necessário pra análise real de filesystem

---

## Questões Que o Mapa Levanta

### Q1: Por Que Context Tem `constraints` e `conventions`?

Se são interpretações, DevRole deveria gerá-las, não ContextBuilder.

Resposta atual: ADR-CONTEXT-RESPONSIBILITY já diz que deveriam sair.

### Q2: Quem Deveria Remover `constraints` e `conventions` de ContextBuilder?

Hoje ContextBuilder gera, DevRole consome.
Experimento mostrou DevRole consegue gerar.

Quem muda? ContextBuilder ou DevRole?

### Q3: `technologies` Alias Deve Sair?

`context.technologies` duplica `context.project.technologies`.

Impacto de remover: DevRole precisa acessar via `context.project.technologies` em vez de `context.technologies`.

### Q4: `currentTask` Deve Sair?

Nunca consumido. Redunda nte com `objective`.

Impacto de remover: Nenhum (não é consumido).

### Q5: ProjectLoader Deve Ter Fallback "npm"?

Hoje: Se não encontra lock file, retorna "npm" default.

Alternativa: Retornar "unknown" ou null?

Impacto: DevRole criaria diferentes constraints.

---

## Recomendação Para Próxima Investigação

Questões que precisam de mais observação:

1. **Validar se constraints/conventions devem sair (ou virar read-only)?**
   - Resposta: Implement refator em ContextBuilder (remover geração), DevRole (adicionar geração), validar se equivalente

2. **Decidir se remover redundâncias (`technologies` alias, `currentTask`)?**
   - Resposta: Simples, remover é seguro (não consumido como alias)

3. **Decidir se ProjectLoader deve ter fallback "npm"?**
   - Resposta: Investigar impacto em non-Node.js projects (teste em HubCRM com fallback "unknown")

4. **Decidir se `project.path` é necessário?**
   - Resposta: Testar Architect Role simulado com path vs. sem path

5. **Decidir se `project.structure` é necessário?**
   - Resposta: Testar Architect Role real precisa de structure

---

**Status:** MAPA DE FLUXO COMPLETO
**Problemas identificados:** 5
**Decisões tomadas:** 0 (aguardando investigação)
**Próxima ação:** Escolher qual problema investigar primeiro
