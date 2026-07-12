# Hipótese: ContextBuilder como Coletor Agnóstico

> Explorando se ContextBuilder deve apenas organizar fatos, delegando interpretação para Roles.
>
> Data: 2026-07-12

---

## Hipótese

**ContextBuilder é responsável apenas por organizar fatos objetivos.**

Interpretação (identificar constraints, detectar convenções, tomar decisões) pertence ao Role que processa o Context.

---

## Modelo Proposto

### Hoje (Current)

```
ProjectMetadata
    ↓
ContextBuilder (organiza + interpreta)
    ├─ readRelevantFiles()        → fatos
    ├─ detectConventions()        → interpretação
    └─ identifyConstraints()      → interpretação
    ↓
Context (já contém interpretação)
    ↓
Dev Role (recebe Context já interpretado)
```

**Problema:** ContextBuilder aplica regras (typescript → codeStyle, npm scripts → constraints). Regras são ecossistema-específicas.

### Proposto (Novo)

```
ProjectMetadata
    ↓
ContextBuilder (organiza APENAS)
    └─ readRelevantFiles()        → fatos objetivos
    ↓
Context (apenas fatos, sem interpretação)
    ├─ projectMetadata
    ├─ relevantFiles (conteúdo)
    ├─ objective
    └─ // SEM conventions, SEM constraints
    ↓
Dev Role (recebe fatos brutos)
    ├─ Interpreta technologies
    ├─ Identifica conventions
    ├─ Identifica constraints
    └─ Cria artifacts baseado em objetivo
```

**Vantagem:** 
- ContextBuilder agnóstico (não conhece npm, React, Next.js, PHP)
- Dev Role (ou outro) interpreta baseado no objetivo
- Mesmo Context pode gerar interpretações diferentes baseado no Role
- Sem acoplamento ContextBuilder ↔ ecossistemas

---

## Análise: O que ContextBuilder Hoje Faz vs. O que Deveria Fazer

### Método: `readRelevantFiles()`

```typescript
private async readRelevantFiles(metadata: ProjectMetadata): Promise<FileContent[]>
```

**Status:** ✓ Fato Objetivo (universal)
- Lê arquivos que ProjectLoader indicou
- Retorna conteúdo bruto
- Mantém

---

### Método: `detectConventions()`

```typescript
private detectConventions(metadata: ProjectMetadata, files: FileContent[]): ConventionSet {
  if (metadata.technologies.includes('TypeScript')) {
    conventions.codeStyle = 'TypeScript'
  }
  if (metadata.technologies.includes('React')) {
    conventions.namingConvention = 'camelCase (React: PascalCase components)'
  }
  if (metadata.technologies.includes('Next.js')) {
    conventions.namingConvention = 'App Router conventions'
  }
  // ... mais interpretações
}
```

**Status:** ✗ Interpretação (ecossistema-específica)
- Faz mapping: TypeScript → codeStyle
- Faz mapping: React → naming convention
- Faz mapping: Next.js → naming convention
- Assume que technologies.includes('X') é sempre revelador

**Problema:**
- E se for PHP? Não temos TypeScript mas usamos type hints
- E se for Python? Não temos React mas usamos type hints também
- Regra "TypeScript → codeStyle" não é universal

**Pertence a:** Dev Role (quando processar Context, interpretar)

---

### Método: `identifyConstraints()`

```typescript
private identifyConstraints(metadata: ProjectMetadata): string[] {
  const constraints: string[] = []
  
  if (!metadata.technologies.length) {
    constraints.push('No known technologies detected')
  }
  if (!metadata.scripts.test) {
    constraints.push('No test script defined')
  }
  if (!metadata.scripts.build) {
    constraints.push('No build script defined')
  }
  if (!metadata.scripts.dev && !metadata.scripts.start) {
    constraints.push('No dev/start script defined')
  }
  // ... mais constraints
}
```

**Status:** ✗ Interpretação (ecossistema-específica)
- Constraint "No test script" assume npm convenção
- Constraint "No build script" assume npm convenção
- Constraint "No known technologies" assume que vazio é problema (falso pra PHP)

**Problema:**
- Essas regras são VERDADEIRAS para Node.js
- FALSAS para PHP (pode ter testes em phpunit, build em shell scripts)

**Pertence a:** Dev Role ou EcosystemSpecificAnalyzer (quando processar Context para objetivo específico)

---

## Consequência: Context Ficaria Simplificado

### Hoje

```typescript
interface Context {
  objective: string
  project: ProjectMetadata
  technologies: string[]
  relevantFiles: FileContent[]
  constraints: string[]               // Interpretação
  currentTask: string
  conventions: ConventionSet           // Interpretação
}
```

### Proposto

```typescript
interface Context {
  objective: string
  projectMetadata: ProjectMetadata
  relevantFilesContent: FileContent[]  // Apenas fatos: path, name, content
  
  // Sem interpretação. Quem interpreta é o Role.
}
```

**Mais simples, mais puro.**

---

## Consequência: Dev Role Cresceria

### Hoje (M4.3)

```typescript
export class DevRole {
  execute(context: Context) {
    // Context já tem conventions + constraints
    // Dev Role apenas reporta o que vê
    
    const result = {
      technologies: context.technologies,
      scripts: context.project.scripts,
      // ...
    }
    
    const artifacts = [
      { type: 'convention', description: 'TypeScript convention' },
    ]
    
    return { result, artifacts }
  }
}
```

### Proposto

```typescript
export class DevRole {
  execute(context: Context) {
    // Context tem apenas fatos brutos
    // Dev Role interpreta
    
    const metadata = context.projectMetadata
    const files = context.relevantFilesContent
    
    // Detectar tecnologias
    const technologies = this.interpretTechnologies(metadata)
    
    // Detectar convenções baseado em objetivo
    const conventions = this.detectConventions(technologies, files, context.objective)
    
    // Identificar constraints (específicas ao objetivo)
    const constraints = this.identifyConstraints(metadata, technologies)
    
    // Criar artifacts
    const artifacts = [...]
    
    return { result, artifacts }
  }
}
```

**Dev Role conhece objetivo, pode interpretar corretamente.**

---

## Alinhamento com Princípios do Harness

### Princípio: "Separar Observação de Interpretação"

Você mencionou antes:
> "Quero manter uma separação clara entre observar e interpretar"

**Hoje:** ContextBuilder observa E interpreta
**Proposto:** ContextBuilder observa, Role interpreta

✓ Alinha perfeitamente

---

### Princípio: Single Responsibility

**Hoje:** 
- ContextBuilder = "organizar + aplicar npm rules + aplicar React rules + ..."
- Cresce com cada novo ecossistema

**Proposto:**
- ContextBuilder = "organizar fatos"
- Dev Role = "interpretar fatos baseado em objetivo"
- EcosystemA Role = "interpretar fatos para objetivo A"
- EcosystemB Role = "interpretar fatos para objetivo B"

✓ Cada componente tem responsabilidade clara

---

### Princípio: Extensibilidade

**Hoje:** Adicionar suporte a PHP = mudar ContextBuilder

**Proposto:** Adicionar suporte a PHP = criar PHPAnalysisRole (novo), não mexer ContextBuilder

✓ Não cascateia mudanças

---

## Validação: O que ContextBuilder Precisaria Fazer Minuto

### readRelevantFiles()

Já faz isso corretamente. Apenas manter.

### Remover: detectConventions()

Mover para Dev Role.

### Remover: identifyConstraints()

Mover para Dev Role.

---

## Risco: Dev Role Fica Complexo?

**Sim, mas é correto.**

Dev Role deveria ser complexo porque:
- Conhece o objetivo
- Pode tomar decisões baseadas no objetivo
- Pode ser específico do ecossistema

ContextBuilder deveria ser simples porque:
- Apenas organiza fatos universais
- Agnóstico de objetivo
- Agnóstico de ecossistema

---

## Consequência: ProjectMetadata Não Precisa de detectedEcosystem

Se interpretação move pra Role, ContextBuilder não precisa saber ecossistema.

ProjectMetadata fica:
```typescript
interface ProjectMetadata {
  path: string
  name: string
  structure: DirectoryStructure
  files: RelevantFiles
  technologies: string[]
  packageManager: 'npm' | 'pnpm' | 'yarn'  // Expandir depois se precisar
  scripts: ScriptMap
  mainFramework?: string
}
```

Sem `detectedEcosystem`.

Dev Role infere ou recebe como hint.

---

## Próximo Passo para Validar

1. Simplificar ContextBuilder (remover detectConventions, identifyConstraints)
2. Mover lógica para Dev Role
3. Testar em Node.js project (Harness)
4. Testar em PHP project (HubCRM)
5. Validar se interpretações fazem sentido

---

## Conclusão Preliminar

**Essa hipótese é coerente.**

Se ContextBuilder é "organizar fatos", então:
- Não precisa saber ecossistema
- Não precisa campo `detectedEcosystem`
- Fica simples e agnóstico
- Interpretação move pra onde pertence: ao Role

**Alinha com:** "Separar observação de interpretação"

---

**Atualizado:** 2026-07-12 02:05
