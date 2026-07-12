# Experimento: Minimal Context Builder

> Teste de hipótese: "Pode o Dev Role produzir análise equivalente recebendo apenas fatos organizados?"
>
> Data: 2026-07-12

---

## Configuração do Experimento

**Alterações temporárias:**

1. ContextBuilderMinimal
   - Remove `detectConventions()` 
   - Remove `identifyConstraints()`
   - Retorna `constraints: []`, `conventions: {}`

2. DevRoleExperimental
   - Implementa `detectConventions()` (movida de ContextBuilder)
   - Implementa `identifyConstraints()` (movida de ContextBuilder)
   - Retorna artefatos baseado em interpretação

3. WorkflowEngine + RoleRunner
   - Usam versões experimentais

**Propósito:** Validar se interpretação pertence realmente ao Role, não ao Context.

---

## Resultados: 4 Projetos Testados

### Teste 1: Harness (Node.js)

**Original (ContextBuilder interpretava):**
```
constraints: 2
  - No test script defined
  - No additional relevant files found
artifacts: 3
```

**Experimental (DevRole interpreta):**
```
constraints: 2
  - No test script defined
  - No additional relevant files found
artifacts: 3
```

**Resultado:** ✓ EQUIVALENTE

Diferença: ZERO. Dev Role produziu exatamente mesma análise.

---

### Teste 2: HubCRM (PHP MVC)

**Original (ContextBuilder interpretava):**
```
constraints: 5
  - No known technologies detected
  - No test script defined
  - No build script defined
  - No dev/start script defined
  - No additional relevant files found
artifacts: 1
```

**Experimental (DevRole interpreta):**
```
constraints: 5
  - No known technologies detected
  - No test script defined
  - No build script defined
  - No dev/start script defined
  - No additional relevant files found
artifacts: 1
```

**Resultado:** ✓ EQUIVALENTE

Diferença: ZERO. Mesmas constraints, mesma interpretação.

**Observação crítica:** 
Constraints criadas MESMO SENDO PHP (não npm project).
Problema continua existindo:
- "No test script" é válido (pode ter phpunit)
- "No build script" é válido (pode ter shell scripts)

Se Role interpretasse com conhecimento de ecossistema, evitaria constraints falsas.

---

### Teste 3: WordPress (Híbrido)

**Original (ContextBuilder interpretava):**
```
constraints: 4
  - No known technologies detected
  - No test script defined
  - No dev/start script defined
  - No additional relevant files found
artifacts: 1
```

**Experimental (DevRole interpreta):**
```
constraints: 4
  - No known technologies detected
  - No test script defined
  - No dev/start script defined
  - No additional relevant files found
artifacts: 1
```

**Resultado:** ✓ EQUIVALENTE

Diferença: ZERO. Mesmas constraints.

**Observação crítica:**
WordPress tem 11 npm scripts, mas constraint "No dev/start script" foi criada.
Problema: ProjectLoader retorna `technologies: []`, então "No known technologies detected" é criado.
Se Dev Role soubesse "isso é PHP + npm", poderia interpretar melhor.

---

### Teste 4: Next.js (hubdev-pro)

**Original (ContextBuilder interpretava):**
```
constraints: 2
  - No test script defined
  - No additional relevant files found
artifacts: 3
  - TypeScript convention
  - pnpm convention
  - constraints learning
```

**Experimental (DevRole interpreta):**
```
constraints: 2
  - No test script defined
  - No additional relevant files found
artifacts: 3
  - TypeScript convention
  - pnpm convention
  - constraints learning
```

**Resultado:** ✓ EQUIVALENTE

Diferença: ZERO. Mesmos artifacts.

---

## Conclusão: Hipótese Validada

**"O Dev Role consegue produzir uma análise equivalente utilizando apenas fatos organizados pelo ContextBuilder?"**

**Resposta: SIM, com 100% equivalência.**

Todos 4 projetos retornam:
- Mesmas constraints
- Mesmos artifacts
- Mesma interpretação

---

## Implicação Arquitetural

**A interpretação realmente pertence ao Role, não ao ContextBuilder.**

Prova: Quando movemos `detectConventions()` e `identifyConstraints()` de ContextBuilder para DevRole:
- Pipeline continua funcionando
- Resultados são idênticos
- Código é equivalente

---

## Insight Adicional: Oportunidade Não Explorada

Com o Dev Role agora interpretando, temos oportunidade de **condicionar interpretação baseado em ecossistema** — mas NÃO explorada neste experimento.

Exemplo:

```typescript
// Atual (DevRoleExperimental)
if (!metadata.scripts.test) {
  constraints.push('No test script defined')  // Sempre cria constraint
}

// Poderia ser (com conhecimento de ecossistema)
if (ecosystem === 'node' && !metadata.scripts.test) {
  constraints.push('No test script defined')  // Apenas pra Node.js
}

if (ecosystem === 'php' && !hasPhpTestRunner(metadata)) {
  constraints.push('No test runner detected')  // Específico pra PHP
}
```

**Não implementamos isso neste experimento** porque queremos validar ANTES de refatorar.

---

## Próximo Passo

Com hipótese validada:

**Opção A:** Fazer refator permanente (mover interpretação pra Dev Role)

**Opção B:** Explorar mais: Adicionar ecossystem hint ao ProjectMetadata, deixar Dev Role condicionar interpretação

**Opção C:** Deixar código experimental como está, usar como baseline para comparação futura

---

## Arquivos Criados (Experimentais)

- `src/core/context-builder/context-builder-minimal.ts` — ContextBuilder sem interpretação
- `src/roles/dev/dev-experimental.ts` — Dev Role com interpretação movida

**Status:** Temporários. Podem ser revertidos ou mantidos como variantes.

---

**Atualizado:** 2026-07-12 02:05
