# ContextBuilder Strategy: Como Identificar Quais Regras Aplicar?

> Análise de 3 abordagens para ContextBuilder conhecer o tipo de projeto.
>
> Data: 2026-07-12

---

## Problema

ContextBuilder recebe ProjectMetadata e faz validações ecossistema-específicas:

```typescript
// npm rule (não universal)
if (!metadata.scripts.test) constraints.push('No test script defined')

// Node.js assumption (não universal)
if (!metadata.technologies.length) constraints.push('No known technologies detected')
```

Como ContextBuilder deveria saber qual ecossistema está processando?

---

## Opção 1: ContextBuilder Infere Sozinho

**Abordagem:** Analisar ProjectMetadata e deduzir ecossistema.

```typescript
private detectEcosystem(metadata: ProjectMetadata): string {
  // Clues em order of confidence:
  
  if (metadata.structure['composer.json']) return 'php'
  if (metadata.structure['composer.lock']) return 'php'
  if (metadata.packageManager === 'composer') return 'php'  // Futuro
  
  if (metadata.structure['requirements.txt']) return 'python'
  if (metadata.structure['pyproject.toml']) return 'python'
  
  if (metadata.packageManager === 'pnpm' || metadata.packageManager === 'npm' || metadata.packageManager === 'yarn') {
    return 'node'
  }
  
  return 'unknown'
}
```

**Vantagem:**
- ContextBuilder é self-sufficient
- Não precisa mudar ProjectMetadata
- Agrupa lógica de detecção num lugar

**Desvantagem:**
- ContextBuilder faz DUAS coisas: detectar ecossistema + aplicar regras
- Detecção pode falhar (ex: composer.json não listado em structure)
- Mistura responsabilidades: "que tipo é?" + "o que validar?"
- Frágil: estrutura pode enganar (WordPress tem package.json e composer.json)

**Evidência Prática:**

| Projeto | Via packageManager | Via technologies | Via structure | Resultado |
|---------|-------------------|------------------|---------------|-----------|
| Harness | node ✓ | node ✓ | — | node ✓ |
| HubCRM | npm ✗ | — | Controllers (php) ✓ | Mixed signal |
| WordPress | npm ✓ | — | composer.json ✓ | Mixed signal |
| hubdev-pro | node ✓ | node ✓ | — | node ✓ |

**Problema:** HubCRM e WordPress têm sinais conflitantes.

---

## Opção 2: ProjectMetadata Indica Explicitamente

**Abordagem:** Adicionar campo ao ProjectMetadata indicando ecossistema detectado.

```typescript
interface ProjectMetadata {
  path: string
  name: string
  structure: DirectoryStructure
  files: RelevantFiles
  technologies: string[]
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'composer' | 'pip' | 'unknown'  // Expandir
  scripts: ScriptMap
  mainFramework?: string
  
  // NOVO: Hint explícito
  detectedEcosystem?: 'node' | 'php' | 'python' | 'go' | 'rust' | 'unknown'
}
```

ProjectLoader decide:

```typescript
// ProjectLoader.load()
const ecosystem = this.detectEcosystem(projectPath, structure, files)

return {
  path, name, structure, files, technologies, packageManager, scripts, mainFramework,
  detectedEcosystem: ecosystem,  // Novo
}
```

ContextBuilder consome:

```typescript
// ContextBuilder.identifyConstraints()
private identifyConstraints(metadata: ProjectMetadata): string[] {
  const constraints: string[] = []
  
  // Somente aplicar npm-specific rules se Node.js
  if (metadata.detectedEcosystem === 'node') {
    if (!metadata.scripts.test) {
      constraints.push('No test script defined')
    }
    if (!metadata.scripts.build) {
      constraints.push('No build script defined')
    }
  }
  
  // Universais (aplicar sempre)
  if (!metadata.technologies.length && metadata.detectedEcosystem === 'unknown') {
    constraints.push('Unknown ecosystem, no technologies detected')
  }
  
  return constraints
}
```

**Vantagem:**
- Separação clara: ProjectLoader detecta, ContextBuilder consome
- ContextBuilder pode guardar regras específicas por ecossistema
- Explícito e testável
- ProjectMetadata fica com responsabilidade única: "representar fatos"

**Desvantagem:**
- Muda contrato de ProjectMetadata
- ProjectLoader precisa detectar ecossistema (pode falhar)
- Mais campos no modelo

**Evidência Prática:**

| Projeto | ProjectLoader retorna | ContextBuilder aplica |
|---------|----------------------|----------------------|
| Harness | detectedEcosystem: 'node' | node-specific rules |
| HubCRM | detectedEcosystem: 'php' | php-specific rules (futuros) |
| WordPress | detectedEcosystem: 'node+php' ou 'unknown' | generic only |
| hubdev-pro | detectedEcosystem: 'node' | node-specific rules |

---

## Opção 3: ContextBuilder Trabalha Apenas com Universais

**Abordagem:** ContextBuilder abandona validações ecossistema-específicas. Novo componente faz isso.

```typescript
// ContextBuilder.identifyConstraints() — SIMPLIFICADO
private identifyConstraints(metadata: ProjectMetadata): string[] {
  // Apenas universais, nunca assume ecossistema
  
  const constraints: string[] = []
  
  // Universal: se detectamos vazio, pode ser problema
  if (metadata.technologies.length === 0) {
    constraints.push('No technologies detected (may be unknown ecosystem)')
  }
  
  // Não validamos scripts (ecossistema-específico)
  // Não validamos frameworks (ecossistema-específico)
  
  return constraints
}
```

Novo componente (EcosystemValidator) faz validações específicas:

```typescript
// EcosystemValidator.validate(metadata: ProjectMetadata, ecosystem: string)
validate(metadata: ProjectMetadata, ecosystem: string): string[] {
  const constraints: string[] = []
  
  if (ecosystem === 'node') {
    if (!metadata.scripts.test) constraints.push('No test script')
    if (!metadata.scripts.build) constraints.push('No build script')
  }
  
  if (ecosystem === 'php') {
    // PHP-specific validations (future)
  }
  
  return constraints
}
```

Workflow Engine:

```typescript
const context = await contextBuilder.build(metadata, objective)

// ContextBuilder retorna constrai ins universais
// Se conhecer ecossistema, validar específico
if (metadata.detectedEcosystem && metadata.detectedEcosystem !== 'unknown') {
  const ecosystemConstraints = await ecosystemValidator.validate(metadata, metadata.detectedEcosystem)
  context.constraints = [...context.constraints, ...ecosystemConstraints]
}
```

**Vantagem:**
- ContextBuilder fica realmente agnóstico
- Responsabilidade única: "construir contexto universal"
- Novas regras ecossistema-específicas = novo validator, não mexe em ContextBuilder
- Alinha com ADR-0003 (Single Responsibility)
- Extensível: adicionar PHP = novo validator, not change existing code

**Desvantagem:**
- Adiciona novo componente (EcosystemValidator)
- Mais complexidade no pipeline
- Requer ProjectMetadata indicar ecossistema (igual Opção 2)

---

## Análise: Qual Alinha com Harness Philosophy?

Revisar princípios do Harness (CLAUDE.md + ADRs):

### ADR-0003: Single Responsibility Principle
> "Cada componente tem responsabilidade clara e isolável. Mudanças em um não cascateiam."

**Opção 1 (Inferir):** ContextBuilder = "detectar ecossistema + aplicar regras" = 2 responsabilidades ✗

**Opção 2 (Explícito):** ContextBuilder = "aplicar regras universais + ecossistema-específicas condicionadas" = clareza ✓

**Opção 3 (Universais):** ContextBuilder = "construir contexto universal", EcosystemValidator = "validar específico" = isolável ✓

### YAGNI: You Aren't Gonna Need It
> "Não construir antes de precisar. Implemente quando observado em 2+ casos reais."

**Opção 1:** Simples, nenhum código novo ✓ mas acumula responsabilidades

**Opção 2:** Mínimo adicional: um field, lógica condicional ✓

**Opção 3:** Novo componente. Precisamos disso agora? NÃO (temos 1 ecossistema Node.js, 1 PHP em estudo) ✗

### Incremental Validation
> "Validar a arquitetura em cada milestone. Impossível terminar com sistema quebrado."

**Opção 1:** Sem mudanças, sistema continua funcionando (mas quebrado para PHP) ⚠️

**Opção 2:** Muda contrato (ProjectMetadata), mas ContextBuilder fica correto ✓

**Opção 3:** Adiciona novo estágio, mais complexo ✓ mas prematura (YAGNI)

---

## Decisão Recomendada

**Opção 2: Explícito com detectedEcosystem**

**Razão:**

1. Respeita Single Responsibility (ProjectLoader detecta, ContextBuilder consome)
2. Honesto sobre uncertainty (unknown quando não puder inferir)
3. Preparado para futuros ecossistemas (apenas adicionar regras no ContextBuilder)
4. Mínimo de mudança (um field novo)
5. Testável e explícito

**Próximo passo:** 
1. Expandir ProjectMetadata com `detectedEcosystem?: string`
2. ProjectLoader implementa detecção
3. ContextBuilder consome hint
4. Validar em experimento PHP real

---

**Atualizado:** 2026-07-12 02:00
