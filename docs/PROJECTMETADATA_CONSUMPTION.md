# Análise de Consumo: ProjectMetadata → ContextBuilder

> Mapeamento de quais campos ProjectMetadata são realmente utilizados.
>
> Data: 2026-07-12

---

## Fluxo do Pipeline

```
ProjectLoader
    ↓ retorna ProjectMetadata
    ↓
ContextBuilder.build(metadata, objective)
    ↓ consome campos específicos
    ↓
Context (resultado)
```

---

## Mapa de Consumo por Campo

### Campos Usados Ativamente

#### 1. `metadata.files` — **ESSENCIAL**

**Linhas:** 38-42, 46

```typescript
filesToRead = [
  { path: metadata.files.packageJson, ... },
  { path: metadata.files.tsConfig, ... },
  { path: metadata.files.claudeMd, ... },
  { path: metadata.files.readme, ... },
]
```

**Uso:** Lê conteúdo de arquivo se existir.

**Classificação:** **ESSENCIAL**
- Sem `files`, ContextBuilder não consegue ler nada
- Trata `undefined` gracefully (filter + try-catch)

**Observação crítica:** 
- Hardcoded: procura apenas packageJson, tsConfig, claudeMd, readme
- Ignora `files.others` (array vazio retornado por ProjectLoader)
- Se composer.json existir, não é acessado

---

#### 2. `metadata.technologies` — **ESSENCIAL MAS PROBLEMÁTICO**

**Linhas:** 18, 70, 74, 78, 123

```typescript
technologies: metadata.technologies,  // Passa para Context (linha 18)

// Detecta convenções (linhas 70-80)
if (metadata.technologies.includes('TypeScript')) { ... }
if (metadata.technologies.includes('React')) { ... }
if (metadata.technologies.includes('Next.js')) { ... }

// Identifica constraints (linha 123)
if (!metadata.technologies.length) {
  constraints.push('No known technologies detected')
}
```

**Uso:** 
- Passa direto para Context.technologies
- Detecta convenções (mapping hardcoded: TypeScript → codeStyle, React → naming, Next.js → naming)
- Marca constraint se vazio

**Classificação:** **ESSENCIAL MAS COM PROBLEMA**

**Problema:** 
- Array vazio é tratado como "constraint" — assume que `[]` sempre é problema
- Em HubCRM (PHP): `technologies: []` → constraint criado ("No known technologies detected")
- Mas em WordPress: `technologies: []` → constraint criado MESMO COM npm scripts presentes
- Lógica assume: "se não temos technologies, há problema"
  - Verdade para Node.js
  - Falsa para PHP puro

**O que ContextBuilder PRECISA:**
- Saber quais tecnologias/frameworks estão presentes
- Detectar convenções baseado nisso
- Não assume que `[]` é sempre erro

---

#### 3. `metadata.scripts` — **ESSENCIAL MAS COM PROBLEMA**

**Linhas:** 127-136

```typescript
if (!metadata.scripts.test) {
  constraints.push('No test script defined')
}
if (!metadata.scripts.build) {
  constraints.push('No build script defined')
}
if (!metadata.scripts.dev && !metadata.scripts.start) {
  constraints.push('No dev/start script defined')
}
```

**Uso:** Verifica presença de scripts específicos (test, build, dev, start)

**Classificação:** **ESPECÍFICO DE ECOSSISTEMA (npm)**

**Problema:**
- Assume npm scripts (test, build, dev, start)
- Em HubCRM (PHP): `scripts: {}` → 3 constraints (no test, no build, no dev)
- Mas PHP MVC não TEM scripts npm — é correto ter vazio
- Constraint "No test script defined" é válido? Não, PHP tem pytest, phpunit, etc.

**O que ContextBuilder PRECISA:**
- Saber quais scripts estão disponíveis
- NÃO asumir npm como padrão
- NÃO criar constraints baseado em npm conventions para projetos não-Node.js

---

#### 4. `metadata.path` — **UTILIZADO**

**Linhas:** 46

```typescript
const fullPath = path.join(metadata.path, fileInfo.path)
```

**Uso:** Construir path absoluto para ler arquivo

**Classificação:** **ESSENCIAL (universalmente preciso)**

---

#### 5. `metadata.name` — **NÃO UTILIZADO**

**Observação:** Campo não é consumido por ContextBuilder

---

#### 6. `metadata.structure` — **NÃO UTILIZADO**

**Observação:** Campo não é consumido por ContextBuilder

---

#### 7. `metadata.packageManager` — **NÃO UTILIZADO**

**Observação:** Field não é consumido por ContextBuilder

---

#### 8. `metadata.mainFramework` — **NÃO UTILIZADO**

**Observação:** Campo não é consumido por ContextBuilder

---

## Resumo: O Que ContextBuilder Realmente Precisa

### Essencial (Bloqueador)
1. `path` — Universalmente preciso, sempre usado
2. `files` — Estrutura para acessar arquivos relevantes
3. `technologies` — Array de tecnologias detectadas (pode estar vazio)

### Problemático (Específico de Ecossistema)
1. `scripts` — Assume npm scripts (test, build, dev, start)
2. `technologies` — Lógica de constraints assume Node.js conventions

### Não Utilizado
1. `name` — Nunca consumido
2. `structure` — Nunca consumido
3. `packageManager` — Nunca consumido
4. `mainFramework` — Nunca consumido

---

## Problema Identificado

**ContextBuilder tem hipóteses sobre o projeto que NÃO vêm de ProjectMetadata:**

```typescript
// Hipótese 1: Existe sempre um "test" script
if (!metadata.scripts.test) { constraint }

// Hipótese 2: Existe sempre um "build" script
if (!metadata.scripts.build) { constraint }

// Hipótese 3: technologies.length === 0 é sempre problema
if (!metadata.technologies.length) { constraint }
```

Essas hipóteses são VERDADEIRAS para Node.js, FALSAS para PHP/Python/etc.

---

## Raiz do Problema

**Não é ProjectMetadata que está wrongly modeled.**

**É ContextBuilder que tem lógica ecossistema-específica (npm/Node.js) embutida.**

ContextBuilder decide:
- "test script é constraint importante" (npm convention)
- "build script é constraint importante" (npm convention)
- "sem technologies é problema" (Node.js assumption)

Essas decisões NÃO deveriam estar em ContextBuilder.

---

## Próximo Passo

Decisão de arquitetura:

**A) Remover hipóteses de ContextBuilder**
- Parar de criar constraints baseado em npm scripts
- Parar de assumir technologies.length > 0
- Deixar ContextBuilder agnóstico

**B) Separar ContextBuilder por ecossistema**
- NodeContextBuilder (npm-specific logic)
- GenericContextBuilder (agnóstico)

**C) Adicionar "ecossystem hint" ao ProjectMetadata**
- `ProjectMetadata.detectedEcosystem: 'node' | 'php' | 'unknown'`
- ContextBuilder usa hint pra decidir quais constraints aplicam

---

## Conclusão

**O modelo ProjectMetadata está OK.**

**O problema está em ContextBuilder ter lógica ecossistema-específica sem saber qual ecossistema está processando.**

---

**Atualizado:** 2026-07-12 01:55
