# ADR: Responsabilidade do ContextBuilder vs. Roles

> Decisão arquitetural baseada em evidência experimental.
>
> Data: 2026-07-12
> Status: ACEITO

---

## Problema

ContextBuilder estava confundindo responsabilidades:
- Organizar fatos (universal)
- Interpretar fatos (específico de objetivo/Role)

Isso acoplava ContextBuilder a convenções Node.js e criava constraints incorretas para projetos PHP/Python.

---

## Decisão

**ContextBuilder é responsável APENAS por organizar fatos objetivos.**

**Interpretação (detectar convenções, identificar constraints) pertence ao Role.**

---

## Justificativa

### Validação Experimental

Experimento com ContextBuilderMinimal + DevRoleExperimental provou:

1. Dev Role consegue produzir análise equivalente recebendo apenas fatos
2. Interpretação é agnóstica do Context — depende do objetivo e do Role
3. Mesmo projeto pode ter interpretações diferentes baseado na tarefa

**Resultados em 4 projetos:** 100% equivalência de output.

### Alinhamento com Princípios

- **Single Responsibility:** ContextBuilder = organizar, Role = interpretar
- **Extensibilidade:** Novo Role = novo interpretador, não muda ContextBuilder
- **Agnóstico:** ContextBuilder não conhece npm, React, PHP, etc.
- **Observação vs. Interpretação:** Divisão clara

---

## Implementação

### Remover de ContextBuilder

```typescript
// REMOVE: detectConventions()
private detectConventions(metadata, files): ConventionSet { ... }

// REMOVE: identifyConstraints()
private identifyConstraints(metadata): string[] { ... }
```

### Manter em ContextBuilder

```typescript
// KEEP: readRelevantFiles()
private async readRelevantFiles(metadata): Promise<FileContent[]> { ... }
```

### Adicionar a Cada Role

```typescript
// ADD: Cada Role implementa interpretação específica ao seu objetivo
class DevRole {
  private detectConventions(context): ConventionSet { ... }
  private identifyConstraints(context): string[] { ... }
}

class QARole {  // Futuro
  private detectConventions(context): ConventionSet { ... }  // Diferente lógica
  private identifyConstraints(context): string[] { ... }    // Diferente foco
}
```

---

## Context Contract: Decisão de Tamanho

**Mantemos Context com campo atual**, apesar de alguns não serem utilizados por Dev Role.

**Razão:** Context é contrato universal do Harness, não contrato do Dev Role.

Diferentes Roles podem consumir diferentes campos:
- Dev Role usa: technologies, scripts, packageManager, name, relevantFiles
- QA Role (futuro) pode usar: structure, mainFramework, path
- Product Role (futuro) pode usar: todos os acima + constraints, conventions

Reduzir Context agora seria otimizar cedo, sem evidência de consumo cruzado.

**Princípio YAGNI:** Não removemos até ter 2+ Roles demonstrando quais campos são universais.

---

## Consequência: ContextBuilder Simplificado

### Antes
```typescript
async build(metadata, objective): Promise<Context> {
  const relevantFiles = await this.readRelevantFiles(metadata)
  const conventions = this.detectConventions(metadata, relevantFiles)
  const constraints = this.identifyConstraints(metadata)
  
  return {
    objective,
    project: metadata,
    technologies: metadata.technologies,
    relevantFiles,
    constraints,  // ← Gerado aqui
    currentTask: objective,
    conventions,  // ← Gerado aqui
  }
}
```

### Depois
```typescript
async build(metadata, objective): Promise<Context> {
  const relevantFiles = await this.readRelevantFiles(metadata)
  
  return {
    objective,
    project: metadata,
    technologies: metadata.technologies,
    relevantFiles,
    constraints: [],  // ← Vazio, Role preenche
    currentTask: objective,
    conventions: {},  // ← Vazio, Role preenche
  }
}
```

**Simplificação:** -60 linhas, 2 métodos removidos

---

## Próximos Passos

1. ✓ Validar hipótese (FEITO — experimento passou)
2. ✓ Aceitar decisão (FEITO — este documento)
3. [ ] Refatorar ContextBuilder permanentemente (remover interpret methods)
4. [ ] Refatorar Dev Role permanentemente (adicionar interpret methods)
5. [ ] Atualizar documentação
6. [ ] Commit com novo ciclo de validação

---

## Revisão: Quando Reconsiderar?

Esta decisão fica válida enquanto:
- Context continua agnóstico (sem campos ecossistema-específicos)
- Roles conseguem interpretar adequadamente
- Novos Roles não causam acoplamento em ContextBuilder

Se futuro Roles precisarem de informação que ContextBuilder conhece mas não passa → reconsiderar.

---

**Aprovado:** 2026-07-12
**Implementação:** Próximo milestone
