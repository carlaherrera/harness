# Descoberta: Qual é o Contrato Universal de Context?

> Investigação através de múltiplos Roles simulados.
> 
> Data: 2026-07-12
> Status: EXPERIMENTO (sem decisão arquitetural)

---

## Hipótese

Qual é o menor contrato universal de Context capaz de atender múltiplos Roles sem acoplar o pipeline à semântica?

---

## Método

Criamos 4 Roles simulados (Dev, Architect, Reviewer, Documentation) e mapeamos:
- Quais campos de Context cada Role consome
- Quais campos são ignorados
- Qual informação seria necessária se o Role fosse real

---

## Roles Simulados

### 1. DevRole (Existente)

**Responsabilidade:** Analisar projeto, detectar convenções, identificar constraints.

**Campos Consumidos:**
- `objective` — Para logging
- `project.name` — Identificar projeto
- `project.technologies` — Detectar convenções
- `project.packageManager` — Criar artifacts
- `project.scripts` — Validar constraints
- `relevantFiles` — Ler conteúdo (CLAUDE.md, package.json)
- `project.files.others` — Verificar se vazio

**Campos NÃO Consumidos:**
- `project.structure` — Nunca lido
- `project.mainFramework` — Nunca lido
- `project.path` — Nunca lido (path já em relevantFiles)
- `constraints` — Agora vazio (Role gera)
- `conventions` — Agora vazio (Role gera)
- `currentTask` — Redundante com `objective`
- `technologies` (alias) — Duplicado

**Consumo Real:** 7 campos / 14 total = 50%

---

### 2. ArchitectRole (Simulado)

**Responsabilidade:** Analisar arquitetura, identificar padrões de design, concerns arquiteturais.

**Campos Consumidos:**
- `objective` — Entender scope da análise
- `project.name` — Identificar projeto
- `project.structure` — **ESSENCIAL** para analisar layering/modularização
- `project.mainFramework` — **NOVO** determina padrão arquitetural
- `technologies` — Entender stack técnico (afeta decisões arquiteturais)
- `project.path` — **ESSENCIAL** para analisar estrutura real do disco

**Campos NÃO Consumidos:**
- `project.scripts` — Não relevante à arquitetura
- `project.packageManager` — Não relevante à arquitetura
- `relevantFiles` — Menos relevante (mas poderia ler architecture.md)
- `constraints` — Não consumido (define suas próprias)
- `conventions` — Não consumido
- `currentTask` — Redundante

**Consumo Real:** 6 campos / 14 total = 43%

**Insight:** Architect precisa de `structure` e `path` que Dev ignora.

---

### 3. ReviewerRole (Simulado)

**Responsabilidade:** Revisar código, identificar problemas de qualidade, validar contra convenções.

**Campos Consumidos:**
- `objective` — Entender scope da revisão
- `project.name` — Identificar projeto
- `technologies` — Revisar contra convenções de linguagem
- `constraints` — **ESSENCIAL** para revisor (constraints são problemas identificados)
- `conventions` — **ESSENCIAL** para revisor (verifica alinhamento)
- `project.scripts` — Verifica se CI/tests existem (qualidade indicator)
- `relevantFiles` — Ler CLAUDE.md (guidelines), package.json (tooling)

**Campos NÃO Consumidos:**
- `project.structure` — Não relevante
- `project.mainFramework` — Coberto por technologies
- `project.packageManager` — Não relevante
- `project.path` — Não precisa filesystem
- `currentTask` — Redundante

**Consumo Real:** 7 campos / 14 total = 50%

**Insight:** Reviewer é único que CONSOME `constraints` e `conventions` (que Dev gera).

---

### 4. DocumentationRole (Simulado)

**Responsabilidade:** Gerar ou validar documentação do projeto.

**Campos Consumidos:**
- `objective` — Entender scope da documentação
- `project.name` — Documento title
- `project.path` — **NOVO** para gerar relative paths, links
- `technologies` — "Built with:" section
- `project.mainFramework` — "Framework:" section
- `project.scripts` — "How to run:" section
- `relevantFiles` — Ler README.md, CLAUDE.md (existem docs?)
- `conventions` — "Project conventions:" section

**Campos NÃO Consumidos:**
- `project.structure` — Menos relevante
- `constraints` — Foca em state atual, não problems
- `project.packageManager` — Menos relevante

**Consumo Real:** 8 campos / 14 total = 57%

**Insight:** Documentation consome mais campos porque precisa descrever projeto completamente.

---

## Matriz de Consumo Cruzado

| Campo | Dev | Architect | Reviewer | Docs | Universal? |
|-------|-----|-----------|----------|------|------------|
| `objective` | ✓ | ✓ | ✓ | ✓ | **SIM** |
| `project.name` | ✓ | ✓ | ✓ | ✓ | **SIM** |
| `project.path` | — | ✓ | — | ✓ | Papel-específico |
| `project.structure` | — | ✓ | — | — | Papel-específico |
| `project.files` | ✓ | — | ✓ | ✓ | Papel-específico |
| `technologies` | ✓ | ✓ | ✓ | ✓ | **SIM** |
| `project.packageManager` | ✓ | — | — | — | Papel-específico |
| `project.scripts` | ✓ | — | ✓ | ✓ | Papel-específico |
| `project.mainFramework` | — | ✓ | — | ✓ | Papel-específico |
| `relevantFiles` | ✓ | — | ✓ | ✓ | Papel-específico |
| `constraints` | ✓ (gera) | — | ✓ (consome) | — | Papel-específico |
| `conventions` | ✓ (gera) | — | ✓ (consome) | ✓ (consome) | Papel-específico |
| `currentTask` | — | — | — | — | REDUNDANTE |
| `technologies` (alias) | ✓ | ✓ | ✓ | ✓ | REDUNDANTE |

---

## Análise de Padrões

### Campos UNIVERSAIS (consumidos por 4/4 Roles)

1. `objective` — Todos precisam entender a tarefa
2. `project.name` — Todos precisam identificar o projeto
3. `technologies` — Todos precisam saber stack técnico

**Insight:** Apenas 3 campos são universais de verdade.

---

### Campos PAPEL-ESPECÍFICOS (consumidos por 1-3 Roles)

Todos os outros campos são específicos de um ou mais papéis:

- **Architect-only:** `project.structure`, `project.mainFramework`, `project.path`
- **Dev-only:** `project.packageManager`
- **Dev + Reviewer + Documentation:** `project.scripts`, `relevantFiles`
- **Reviewer + Documentation:** `conventions`, `constraints`

---

### Campos REDUNDANTES

1. **`currentTask`** — Duplicado de `objective`
   - Nunca consumido por nenhum Role
   - Pode ser removido

2. **`technologies` (alias em Context)**
   - Duplicado de `project.technologies`
   - Todos acessam via `context.technologies` ou `context.project.technologies`
   - Desnecessário ter ambos

---

## Consequências Observadas

### Consecuência 1: Diferentes Roles Precisam de Diferentes Informações

- **Dev:** packageManager, scripts
- **Architect:** structure, mainFramework, path
- **Reviewer:** constraints, conventions (que Dev gera)
- **Documentation:** mainFramework, scripts, conventions

Não há um subset que atende todos.

### Consequência 2: Há Fluxo de Informação Entre Roles

- Dev gera `constraints` e `conventions`
- Reviewer consome o que Dev gerou
- Documentation consome o que Dev gerou

Isso sugere que Context não é apenas "entrada" mas também "saída" de Roles.

### Consequência 3: Context Atual é Adequado mas Inchado

Context atual tem **tudo que Roles precisam**, mas também tem:
- Campos nunca consumidos (`structure` por Dev, `mainFramework` por Dev)
- Campos redundantes (`currentTask`, `technologies` alias)
- Campos papel-específicos misturados com universais

---

## Questões em Aberto

### Q1: Context Deve Ser Homogêneo ou Heterogêneo?

**Opção A:** Um Context com todos os campos (atual)
- Simples, todos Roles veem tudo
- Inchado, cada Role ignora ~50% dos dados

**Opção B:** Context com subsets por papel
- Cada Role recebe apenas o que precisa
- Complexo, requer decisão "qual campo pra qual papel"

**Evidência:** Atual (A) funciona. Não há evidência de que B seria melhor.

### Q2: Constraints e Conventions Devem Estar em Context?

**Hoje:** Dev gera, Context armazena vazio, Reviewer consome.

**Alternativas:**
- Remover de Context, passar como separate output?
- Manter em Context como "generated by previous Role"?
- Adicionar versão "role-generated" vs "context-only"?

**Evidência:** Reviewer precisa deles. Mover fora de Context complica integração.

### Q3: Project.Path Deve Estar em Context?

**Dev:** Nunca usa
**Architect:** Essencial para analisar estrutura real
**Reviewer:** Não precisa
**Documentation:** Útil para gerar links

**Alternativa:** Context tem apenas relative paths, Path vem via Environment/Config?

**Evidência:** Insuficiente. Apenas 2 Roles precisam.

### Q4: Qual é o Contrato Minimalista vs. Completo?

**Minimalista (3 campos):**
- `objective`
- `project.name`
- `technologies`

**Problema:** Nenhum Role consegue fazer seu trabalho. Architect precisa de structure, etc.

**Completo (14 campos):**
- Tudo que existe hoje

**Problema:** Inchado, campos nunca consumidos.

**Meio-termo (8 campos)?**
- `objective`, `project.name`, `technologies`
- `project.path`, `project.structure`, `project.scripts`
- `relevantFiles`, `constraints`?

**Evidência:** Sem testear com Roles reais, não sabemos.

---

## Observações (Sem Conclusão)

1. **Dev usa 50% de Context** (tecnicamente funciona, ignora rest)
2. **Architect precisa de campos que Dev ignora** (structure, path)
3. **Reviewer consome o que Dev gera** (constraints, conventions)
4. **Documentation precisa de tudo** (mais completo consumidor)
5. **Apenas 3 campos realmente universais** (objective, name, technologies)
6. **Há informação circulando entre Roles** (Dev output → Reviewer input)
7. **Context atual é adequado mas redundante** (funciona mas inchado)

---

## Próximo Passo

Não decidir ainda.

Questões que precisam responder:

1. Testar Roles reais (não simulados) — precisam de mais informação?
2. Validar se Reviewer realmente consome `constraints` e `conventions` de Dev
3. Explorar se pode haver "Context Versioned" (Context v1 = ContextBuilder, v2 = after Role, etc.)
4. Investigar se Project.Path é realmente necessário ou pode vir de Environment

---

## Arquivos Criados (Experimentais)

- `src/roles/architect/architect-simulated.ts`
- `src/roles/reviewer/reviewer-simulated.ts`
- `src/roles/documentation/documentation-simulated.ts`

(Não integrados ao pipeline. Apenas para análise.)

---

**Status:** DESCOBERTA
**Decisão Arquitetural:** NENHUMA (aguardando mais evidência)
**Atualizado:** 2026-07-12 02:15
