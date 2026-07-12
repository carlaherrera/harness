# Análise: Quais Campos de Context São Realmente Consumidos?

> Mapeamento exato de consumo em DevRoleExperimental.
>
> Data: 2026-07-12

---

## Interface Context (Atual)

```typescript
interface Context {
  objective: string
  project: ProjectMetadata
  technologies: string[]
  relevantFiles: FileContent[]
  constraints: string[]
  currentTask: string
  conventions: ConventionSet
}
```

---

## Mapa de Consumo por Campo

### Campo: `objective` (string)

**Linhas:** 14

```typescript
logger.info({ msg: 'Dev role executing', ..., objective: context.objective })
```

**Uso:** Logging apenas

**Classificação:** **UTILIZADO MAS REDUNDANTE**
- Informação já passada como argumento `execute(context, objective)`
- Está em Context apenas para referência

---

### Campo: `project.name` (string)

**Linhas:** 14, 86

```typescript
logger.info({ msg: 'Dev role executing', project: context.project.name, ... })
// ...
projectName: context.project.name,
```

**Uso:** Logging e RoleOutput result

**Classificação:** **UTILIZADO**
- Necessário para identificar projeto

---

### Campo: `project.technologies` (string[])

**Linhas:** 25, 51, 107, 111, 115

```typescript
technologies: context.project.technologies,  // Logging
if (context.technologies.includes('TypeScript')) { ... }  // Interpretação
if (context.technologies.includes('React')) { ... }
if (context.technologies.includes('Next.js')) { ... }
```

**Uso:** 
- Logging
- Detectar convenções (TypeScript → codeStyle, React → naming, etc.)
- Contar technologies

**Classificação:** **ESSENCIAL**
- Sem este campo, não pode interpretar convenções
- Sem este campo, não pode saber qual projeto é

---

### Campo: `project.packageManager` (string)

**Linhas:** 26, 61

```typescript
packageManager: context.project.packageManager,  // Logging
if (context.project.packageManager === 'pnpm') { ... }  // Interpretação
```

**Uso:**
- Logging
- Detectar convenção (pnpm → strict dependency resolution)

**Classificação:** **UTILIZADO**
- Necessário para criar artifact sobre package manager

---

### Campo: `project.scripts` (ScriptMap)

**Linhas:** 27, 165, 169, 173

```typescript
scripts: Object.keys(context.project.scripts),  // Logging

if (!context.project.scripts.test) { ... }      // Constraint detection
if (!context.project.scripts.build) { ... }
if (!context.project.scripts.dev && !context.project.scripts.start) { ... }
```

**Uso:**
- Logging
- Identificar constraints (falta test, build, dev/start scripts)

**Classificação:** **ESSENCIAL**
- Sem este campo, não pode validar scripts

---

### Campo: `project.files` (RelevantFiles)

**Linhas:** 177

```typescript
if (context.project.files.others.length === 0) { ... }  // Constraint
```

**Uso:** Constraint "No additional relevant files found"

**Classificação:** **UTILIZADO MAS BAIXA IMPORTÂNCIA**
- Apenas verifica se array está vazio
- Informação marginal

---

### Campo: `project.structure` (DirectoryStructure)

**NÃO UTILIZADO**

**Classificação:** **NÃO UTILIZADO**

---

### Campo: `project.mainFramework` (string | undefined)

**NÃO UTILIZADO**

**Classificação:** **NÃO UTILIZADO**

---

### Campo: `project.path` (string)

**NÃO UTILIZADO** (em DevRoleExperimental)

**Nota:** Usado em ContextBuilder pra ler arquivos, não em Role

**Classificação:** **NÃO UTILIZADO PELO ROLE**

---

### Campo: `technologies` (string[]) — DUPLICADO

**Linhas:** 51, 87, 107, 111, 115, 161

```typescript
// ACESSO 1: Via context.technologies (que é alias de context.project.technologies)
if (context.technologies.includes('TypeScript')) { ... }
technologiesCount: context.technologies.length,

// ACESSO 2: Via context.project.technologies (redundante)
technologies: context.project.technologies,  // Logging
```

**Uso:** Exatamente igual a `context.project.technologies`

**Classificação:** **REDUNDANTE**
- `context.technologies` é apenas um alias de `context.project.technologies`
- Duplicação desnecessária

---

### Campo: `relevantFiles` (FileContent[])

**Linhas:** 43, 44, 120, 136

```typescript
count: context.relevantFiles.length,
files: context.relevantFiles.map((f) => ({ name: f.name, relevance: f.relevance })),

const claudeMd = context.relevantFiles.find((f) => f.name === 'CLAUDE.md')
const packageJson = context.relevantFiles.find((f) => f.name === 'package.json')
```

**Uso:**
- Logging (count, list)
- Leitura de CLAUDE.md para detectar conventions (test framework, commit convention)
- Leitura de package.json para detectar conventions (test framework via scripts)

**Classificação:** **ESSENCIAL**
- Sem este campo, não consegue ler conteúdo de arquivos
- Necessário para detectar conventions baseado em conteúdo

---

### Campo: `constraints` (string[]) — AGORA VAZIO

**Linhas:** Não utilizado em DevRoleExperimental

**Não é lido.** Apenas preenchido por ContextBuilderMinimal como vazio.

**Classificação:** **NÃO UTILIZADO (propositalmente)**
- Antes estava em Context (gerado por ContextBuilder)
- Agora DevRole gera seus próprios constraints
- Campo é redundante

---

### Campo: `currentTask` (string)

**NÃO UTILIZADO**

**Classificação:** **NÃO UTILIZADO**
- Mesmo valor que `objective`
- Redundante

---

### Campo: `conventions` (ConventionSet) — AGORA VAZIO

**Linhas:** Não utilizado em DevRoleExperimental

**Não é lido.** Apenas preenchido por ContextBuilderMinimal como vazio.

**Classificação:** **NÃO UTILIZADO (propositalmente)**
- Antes estava em Context (gerado por ContextBuilder)
- Agora DevRole gera suas próprias conventions
- Campo é redundante

---

## Resumo: O que Dev Role Realmente Precisa

### Essencial (Bloqueador)

1. **`project.technologies`** — Detectar convenções
2. **`project.scripts`** — Validar constraints
3. **`project.packageManager`** — Criar artifacts sobre manager
4. **`project.name`** — Identificar projeto
5. **`relevantFiles`** — Ler conteúdo (CLAUDE.md, package.json)

### Utilizado Mas Baixa Importância

1. **`project.files.others`** — Apenas verificar se vazio (low signal)
2. **`objective`** — Apenas logging

### Não Utilizado (Mas Ainda no Context)

1. `project.structure` — Nunca lido
2. `project.mainFramework` — Nunca lido
3. `project.path` — Nunca lido
4. `currentTask` — Redundante com `objective`
5. `constraints` — Agora vazio (gerado por Role)
6. `conventions` — Agora vazio (gerado por Role)

### Redundante

1. **`technologies`** — Duplicado de `project.technologies`

---

## Contexto Mínimo Necessário

Se removêssemos tudo que NÃO é utilizado:

```typescript
interface MinimalContext {
  objective: string
  
  project: {
    name: string
    technologies: string[]
    packageManager: string
    scripts: ScriptMap
    files: {
      others: string[]
    }
  }
  
  relevantFiles: FileContent[]
}
```

**Tamanho reduzido em ~40%** (removeria structure, mainFramework, path, currentTask, constraints, conventions, redundant technologies).

---

## Análise de Impacto: Se Simplificássemos

**Pergunta:** Podemos remover campos não utilizados?

**Resposta:**

- ✓ `project.structure` — Seguro remover (nunca lido por Role)
- ✓ `project.mainFramework` — Seguro remover (nunca lido por Role, apenas interpretado por ContextBuilder)
- ✓ `project.path` — Seguro remover (não lido por Role, lido por ContextBuilder pra file reading, mas path já está em relevantFiles)
- ✓ `currentTask` — Seguro remover (redundante com `objective`)
- ✓ `constraints` — Seguro remover (Role gera seus próprios)
- ✓ `conventions` — Seguro remover (Role gera suas próprias)
- ✓ `technologies` (alias) — Seguro remover (acesse via `project.technologies`)

**Caveat:** Remover `project.path` requer que relevantFiles tenha path absoluto, não relativo.

---

## Conclusão

**Context está inchado com informações não utilizadas:**

- 40% dos campos nunca são lidos por Role
- 3 campos são redundantes (technologies, currentTask, constraints, conventions)
- Interpretações (constraints, conventions) deveriam ser geradas pelo Role, não Context

**Minimalismo:** Context deveria conter apenas fatos que Role realmente precisa + objetivo.

**Próximo passo:** Decidir se simplificar agora (remover campos não utilizados) ou deixar inchado por backward compatibility.

---

**Atualizado:** 2026-07-12 02:08
