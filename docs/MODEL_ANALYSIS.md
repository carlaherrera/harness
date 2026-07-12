# Análise do Modelo: ProjectMetadata

> Revisão crítica do modelo de dados baseada em evidência de 4 experimentos.
>
> Data: 2026-07-12

---

## Modelo Atual: ProjectMetadata

```typescript
interface ProjectMetadata {
  path: string
  name: string
  structure: DirectoryStructure        // [path]: 'file' | 'directory'
  files: RelevantFiles                 // packageJson?, tsConfig?, claudeMd?, readme?, others[]
  technologies: string[]               // ["React", "Next.js", "TypeScript"]
  packageManager: 'npm' | 'pnpm' | 'yarn'
  scripts: ScriptMap                   // { [name]: command }
  mainFramework?: string               // "Next.js"
}
```

---

## Problemas Observados em Experimentos

### 1. `packageManager: 'npm' | 'pnpm' | 'yarn'` — Enum Muito Restritivo

**Evidência:**
- HubCRM (PHP) retorna "npm" default (incorreto, não tem npm)
- WordPress retorna "npm" (detecta npm, ignora composer)
- ProjectLoader não pode representar "não há npm" ou "múltiplos package managers"

**Problema:** Enum assume Node.js como único ecossistema de package managers.

**O que falta:**
- composer (PHP)
- pip/poetry (Python)
- go mod (Go)
- cargo (Rust)
- maven/gradle (Java)
- gem (Ruby)
- O caso "unknown" ou "none" (projetos sem package manager)

### 2. `technologies: string[]` — Vazio Quando Desconhecido

**Evidência:**
- HubCRM: `technologies: []` (deveria indicar "PHP detectado mas tipo unknown")
- WordPress: `technologies: []` (deveria indicar "PHP detectado mas tipo unknown")
- Apenas Node.js projects retorna values corretos

**Problema:** Array vazio é ambíguo: "nenhuma tech detectada" ou "formato desconhecido"?

**O que falta:**
- Forma de registrar "detectamos algo, mas não sabemos o quê"
- Capacidade de sugerir possíveis tecnologias
- Indicador de confiança/certainty

### 3. `scripts: ScriptMap` — Assume npm Scripts

**Evidência:**
- HubCRM: `scripts: {}` (PHP não tem npm scripts)
- WordPress: `scripts: {...}` (npm scripts ok, mas PHP scripts ignorados)
- Apenas projetos Node.js retorna values corretos

**Problema:** ScriptMap é vazio quando não há npm scripts, não captura outros tipos de scripts.

**O que falta:**
- Script type: "npm" vs "shell" vs "make" vs "php" vs "python"
- Scripts PHP (migrations, seeds, etc)
- Make targets
- Tox configs
- Qualquer automation além npm

### 4. `files: RelevantFiles` — Whitelist Hardcoded

**Evidência:**
- Apenas package.json, tsconfig.json, CLAUDE.md, readme.md são "relevant"
- composer.json é ignorado (não está em whitelist)
- Qualquer arquivo específico de tecnologia é ignorado

**Problema:** Relevant é definido como "arquivos que Harness espera encontrar", não "arquivos relevantes para o projeto real".

**O que falta:**
- Mecanismo plugável para "relevant files por ecossistema"
- ou
- Estrutura que capture "encontramos esses arquivos, não sabemos se são relevantes"

### 5. `mainFramework?: string` — Limitado a Framework/Framework

**Evidência:**
- Next.js, React → detectados corretamente
- PHP MVC custom → não detectado (não é framework conhecido)
- WordPress → não detectado
- Laravel → não teria suporte

**Problema:** mainFramework assume lista pré-definida de frameworks Node.js.

**O que falta:**
- Forma de representar "padrão arquitetural desconhecido detectado (MVC folders, WordPress structure)"
- Indicador de "custom framework" vs "known framework"

---

## Pergunta Fundamental

**"O que um ProjectMetadata precisa representar para descrever qualquer projeto de software?"**

### Resposta baseada em Evidência

ProjectMetadata precisa representar **dois níveis de informação:**

#### Nível 1: Fatos Universais (sempre accurate)
```typescript
{
  path: string              // Sempre conhecer
  name: string              // Sempre conhecer
  structure: {...}          // Sempre descobrir (FS level)
}
```

Esses 3 campos funcionam pra QUALQUER projeto.

#### Nível 2: Interpretação Ecossistema-Específica (pode ser unknown)
```typescript
{
  packageManager?: string   // Pode ser "npm", "pnpm", "yarn", "composer", "pip", "unknown"
  technologies?: string[]   // Pode ser [], pode ter confidence score
  scripts?: {...}           // Pode ser vazio, pode ter type info
  files?: {...}             // Pode ser parcial, pode ter type info
  mainFramework?: string    // Pode ser undefined, pode ter certainty
}
```

**O problema:** Modelo atual força Nível 2 a se comportar como Nível 1.

---

## Propostas de Evolução do Modelo

### Opção A: Expandir ProjectMetadata

```typescript
interface ProjectMetadata {
  // Nível 1: Universais (sempre accurate)
  path: string
  name: string
  structure: DirectoryStructure
  
  // Nível 2: Ecossistema-Específico (com uncertainty)
  packageManagers: Array<{
    type: string        // "npm" | "composer" | "pip" | "unknown"
    lockFile?: string
    configFile?: string
  }>
  
  technologies: Array<{
    name: string
    detectionMethod: string  // "package.json" | "composer.json" | "import statement" | "unknown"
    confidence: 'high' | 'medium' | 'low'
  }>
  
  scripts: Array<{
    name: string
    command: string
    type: 'npm' | 'shell' | 'php' | 'python' | 'make' | 'unknown'
  }>
  
  files: Array<{
    path: string
    type: 'config' | 'documentation' | 'package-manager' | 'unknown'
    relevance: 'high' | 'medium' | 'low'
    ecosystem?: string  // "node" | "php" | "python" | etc
  }>
  
  framework?: {
    name: string
    type: 'known' | 'custom' | 'unknown'
    detectionMethod: string
  }
}
```

**Tradeoff:** Mais complexo, mas explícito sobre uncertainty.

### Opção B: Separar Concerns — ProjectStructure + EcosystemInfo

```typescript
// Universalmente preciso
interface ProjectStructure {
  path: string
  name: string
  structure: DirectoryStructure
}

// Ecossistema-específico (pode falhar/ser unknown)
interface EcosystemInfo {
  detectedEcosystems: Array<'node' | 'php' | 'python' | 'unknown'>
  packageManager?: string
  technologies?: string[]
  scripts?: ScriptMap
  mainFramework?: string
}

// Combinado
interface ProjectMetadata extends ProjectStructure {
  ecosystem: EcosystemInfo
}
```

**Tradeoff:** Separação clara, mas exige mudança de consumidores.

### Opção C: Manter Simples, Aceitar Gaps

Não alterar ProjectMetadata. Aceitar que retorna "npm" default e [] para tech quando desconhecido.

ContextBuilder ou novo componente preenche gaps depois.

**Tradeoff:** Honesto sobre limitação, mantém ProjectLoader simples.

---

## Qual Opção Alinha com Harness Philosophy?

Lembrar CLAUDE.md, ADR-0003 (Responsabilidade Única):

> "Cada componente tem responsabilidade clara e isolável."

**Opção B** alinha com isso:
- ProjectLoader = "Descobrir estrutura e fatos universais"
- EcosystemDetector (novo) = "Identificar e detalhar ecossistema específico"

**Opção C** alinha com YAGNI + evidência:
- ProjectLoader simples, especializado em Node.js
- Documentar limitação
- Evolve quando tiver evidência de 3+ ecossistemas reais em uso

---

## Conclusão Preliminar

**O Problema NÃO é "ProjectLoader é Node.js-only".**

**O Problema é "ProjectMetadata conflate fatos universais com interpretação ecossistema-específica".**

Exemplo:
- `packageManager: 'npm' | ...` — força choice, não permite "unknown"
- `technologies: string[]` — vazio é ambíguo
- `mainFramework?: string` — undefined pode significar "não detectado" ou "não é um app"

Solução pertence ao modelo de dados, não à implementação do ProjectLoader.

---

**Próximo Passo:** Revisão arquitetural com essa perspectiva.

Decidir:
1. Expandir ProjectMetadata (Opção A)?
2. Separar concerns (Opção B)?
3. Aceitar limitação, documentar (Opção C)?

---

**Atualizado:** 2026-07-12 01:52
