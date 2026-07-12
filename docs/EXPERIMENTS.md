# Harness v0 — Matriz de Experimentos

> Documento de evidências comparativas entre projetos reais.
> 
> Objetivo: Identificar quais fatos ProjectLoader retorna são universais vs. ecossistema-específicos.

---

## Experimento 1: Harness (Node.js + TypeScript)

**Caminho:** `F:\harness-piloto`

**Tipo:** Node.js/TypeScript, CLI app, monorepo-like

### O que Harness Detectou

```
tecnologias:        ["TypeScript"]
packageManager:     "pnpm"
scripts:            ["build", "dev", "type-check", "lint", "format"]
mainFramework:      undefined
arquivos relevantes: ["package.json", "tsconfig.json", "CLAUDE.md", "README.md"]
estrutura detectada: src/, docs/, node_modules/, .eslintrc.js, .prettierrc, tsconfig.json, package.json (primeiras 10)
```

### Análise

| Aspecto | Status | Notas |
|---------|--------|-------|
| Estrutura | ✓ Detectada | Diretórios (src, docs) e arquivos (tsconfig, package.json) |
| Arquivos relevantes | ✓ Detectada | package.json, tsconfig.json, CLAUDE.md, README.md todos presentes |
| Tecnologias | ✓ Detectada corretamente | TypeScript via tsconfig.json + package.json deps |
| Package manager | ✓ Detectado corretamente | pnpm-lock.yaml presente |
| Scripts | ✓ Detectados corretamente | npm scripts existem e foram extraídos |
| Framework principal | ✓ Correto (undefined) | Não é um app framework, é biblioteca |
| Convenções | Parcial | TypeScript, pnpm detectados depois em ContextBuilder |

### O que Não Detectou

- Nenhum fato relevante perdido

### O que Detectou Incorretamente

- Nada

### O que Gostaríamos que Detectasse

- Nada específico (baseline adequado)

---

## Experimento 2: HubCRM OptaDev (PHP MVC)

**Caminho:** `F:\hubcrm-optadev`

**Tipo:** PHP/MVC, aplicação web real

### O que Harness Detectou

```
tecnologias:        []
packageManager:     "npm" (default, incorreto)
scripts:            []
mainFramework:      undefined
arquivos relevantes: ["CLAUDE.md"]
estrutura detectada: [
  "app",
  "Controllers",
  "Core",
  "Helpers",
  "Middleware",
  "Models",
  "CLAUDE.md",
  "config",
  "app.php",
  "database.example.php"
]
```

### Análise

| Aspecto | Status | Notas |
|---------|--------|-------|
| Estrutura | ✓ Detectada | Diretórios MVC padrão (Controllers, Models, Middleware, Core, Helpers, app) presentes |
| Arquivos relevantes | ⚠️ Incompleto | Apenas CLAUDE.md. Não detectou composer.json, .php files, README |
| Tecnologias | ✗ Não detectada | Retornou []. PHP não é identificado. |
| Package manager | ✗ Detectado incorretamente | Retornou "npm" (default). Projeto PHP não usa npm. |
| Scripts | ✗ Não detectados | Retornou []. Scripts PHP não estão em package.json. |
| Framework principal | ✗ Não detectado | Retornou undefined. MVC PHP custom não é reconhecido. |
| Convenções | ✗ Não detectadas | PHP, MVC não foram identificadas. |

### O que Não Detectou

- PHP como linguagem
- Composer (package manager de PHP)
- Scripts PHP (run.php, migrate.php, etc se existirem)
- Framework MVC custom
- Arquivos PHP relevantes (composer.json, .php files)
- Constraints específicas de PHP (falta de composer, etc)

### O que Detectou Incorretamente

- `packageManager: "npm"` — deveria ser "unknown" ou "composer" ou nada
- Estrutura MVC é detectada mas não interpretada

### O que Gostaríamos que Detectasse

- PHP como tecnologia
- Composer como package manager (se composer.json existir)
- Estrutura MVC como padrão
- Arquivos PHP relevantes (Controllers, Models, config)
- Scripts PHP disponíveis (se houver scripts em raiz ou config)

---

## Comparação: Node.js vs PHP

### Fatos Universais (Confirmados)

| Fato | Harness | HubCRM |
|------|---------|--------|
| Estrutura de diretórios | ✓ | ✓ |
| Arquivos de config existem | ✓ | ⚠️ (CLAUDE.md só) |
| Nome do projeto | ✓ | ✓ |
| Path relativo | ✓ | ✓ |

**Conclusão:** Estrutura e nome são universais. Arquivos relevantes dependem de saber qual tipo de projeto é.

### Fatos Ecossistema-Específicos (Confirmados)

| Fato | Node.js | PHP |
|------|---------|-----|
| Package manager | npm/yarn/pnpm | composer (ou nenhum) |
| Detection method | Lock files (pnpm-lock.yaml) | composer.json |
| Scripts | npm scripts (package.json) | Scripts PHP customizados ou shell scripts |
| Technologies | package.json deps | Não há equivalente direto |
| Framework | Detectável via deps | Estrutura (Controllers, Models) |

**Conclusão:** Tudo relacionado a "como o projeto é construído" é específico de ecossistema.

---

## Hipótese: Responsabilidade do ProjectLoader

**ProjectLoader deve:**
1. Coletar fatos universais (estrutura, name, path, arquivos genéricos)
2. Detectar _tipo_ de projeto (Node.js? PHP? Python?)
3. Delegar detecção de ecossistema-específico para outro componente (se necessário)

**ProjectLoader NÃO deve:**
- Conhecer hardcoded Node.js, PHP, Python, etc.
- Assumir package.json como padrão universal
- Retornar valores default (npm) quando desconhecido

---

---

## Experimento 3: WordPress (bw-newstack-for-publishers)

**Caminho:** `F:/projetos/berwanger/bw-newstack-for-publishers`

**Tipo:** WordPress + PHP plugins + npm build tools (híbrido)

### O que Harness Detectou

```
tecnologias:        []
packageManager:     "npm"
scripts:            ["build", "lint", "format", "format:check", "phpcs", "phpcbf", "wp-env:start", "wp-env:stop", "wp-env:destroy", "wp-env:logs", "wp-env:cli"]
mainFramework:      undefined
arquivos relevantes: ["package.json", "README.md"]
estrutura detectada: [
  "composer.json",
  "composer.lock",
  "docs",
  "ADDONS.md",
  "menus.md",
  "STYLEGUIDE.md",
  "WP_ENV.md",
  "graphify-out",
  "manifest.json",
  "package-lock.json"
]
```

### Análise

| Aspecto | Status | Notas |
|---------|--------|-------|
| Estrutura | ✓ Detectada | Diretórios e arquivos principais visíveis |
| Arquivos relevantes | ⚠️ Incompleto | package.json, README detectados. Mas composer.json NÃO listado em "relevant files" |
| Tecnologias | ✗ Não detectada | Retornou []. PHP, WordPress não identificados. |
| Package manager | ⚠️ Detectado parcialmente | Retornou "npm" (package-lock.json existe). Mas IGNORA composer.json que também existe. |
| Scripts | ✓ Detectados corretamente | npm scripts extraídos (11 encontrados, incluindo phpcs, phpcbf) |
| Framework principal | ✗ Não detectado | Retornou undefined. WordPress não é reconhecido. |
| Convenções | ✗ Não detectadas | PHP, WordPress, npm build tools não foram identificadas. |

### O que Não Detectou

- PHP como linguagem/tecnologia
- WordPress como framework
- Composer como package manager (ignorado em favor de npm)
- PHP-specific patterns (plugins dir, wp-env config)

### O que Detectou Incorretamente

- `packageManager: "npm"` — correto detectar npm, mas IGNORA composer.json que é igualmente importante
- Estrutura WordPress não é interpretada

### O que Gostaríamos que Detectasse

- WordPress como framework/CMS
- PHP como tecnologia (mesmo com npm presente)
- Composer como package manager (segundo package manager)
- Padrão híbrido (PHP + npm build tools)
- Arquivos relevantes: composer.json, wp-env.json, plugin files

---

## Comparação: Node.js vs PHP (MVC) vs WordPress (Híbrido)

### Padrão Observado

| Fato | Node.js | PHP MVC | WordPress |
|------|---------|---------|-----------|
| Package manager detectado | ✓ pnpm | ✗ npm (default) | ⚠️ npm (ignora composer) |
| Technologies | ✓ Detecta via deps | ✗ [] | ✗ [] |
| Scripts | ✓ npm scripts | ✗ [] | ✓ npm scripts (11) |
| Relevant files | ✓ Completo | ⚠️ CLAUDE.md só | ⚠️ Incompleto |
| Framework | ✓ Correto (undefined) | ✗ Não detecta MVC | ✗ Não detecta WP |

### Hipótese Refinada

**O problema NÃO é "PHP vs Node.js".**

O problema é: **ProjectLoader assume que existe um único package manager por projeto.**

Evidências:
1. **Harness (Node):** ✓ Detecta pnpm via lock file
2. **HubCRM (PHP):** ✗ Não detecta composer, retorna "npm" default
3. **WordPress (Híbrido):** ⚠️ Detecta npm-lock.json PRIMEIRO, ignora composer.json

Comparação de prioridade em `detectPackageManager()`:
```
procura: ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']
ignora: composer.json, requirements.txt, Gemfile, go.sum, etc.
```

**Consequência:** Projetos que usam apenas composer ou só Python são detectados como "npm" (default incorreto).

---

## Conclusão Preliminar

**Mistura de responsabilidades confirmada:**

ProjectLoader deveria:
1. ✓ Detectar estrutura (universal)
2. ✓ Encontrar arquivos de config (universal)
3. ✗ Assumir Node.js como padrão (ecossistema-específico)
4. ✗ Retornar "npm" como fallback (ecossistema-específico)

**Próxima decisão:**

Após experimento com projeto Node.js adicional (React/Vite), teremos 4 data points para definir escopo claro de ProjectLoader.

---

## Experimento 4: Next.js (hubdev-pro)

**Caminho:** `F:/projetos/hubdev-pro`

**Tipo:** Next.js 16 + React 19 + TypeScript, aplicação real

### O que Harness Detectou

```
tecnologias:        ["React", "Next.js", "TypeScript"]
packageManager:     "pnpm"
scripts:            ["dev", "build", "start", "lint"]
mainFramework:      "Next.js"
arquivos relevantes: ["package.json", "tsconfig.json", "CLAUDE.md", "README.md"]
estrutura detectada: [
  "AGENTS.md",
  "CLAUDE.md",
  "components.json",
  "docs",
  "architecture.md",
  "catalog-module-guide.md",
  "catalog-module.prd.md",
  "dynamic-theming.md",
  "orcamento-model.php",
  "orcamentos-description.md"
]
```

### Análise

| Aspecto | Status | Notas |
|---------|--------|-------|
| Estrutura | ✓ Detectada | Diretórios e arquivos principais visíveis |
| Arquivos relevantes | ✓ Detectada corretamente | package.json, tsconfig.json, CLAUDE.md, README.md todos presentes |
| Tecnologias | ✓ Detectada corretamente | React, Next.js, TypeScript detectados via package.json deps + tsconfig |
| Package manager | ✓ Detectado corretamente | pnpm-lock.yaml presente, detectado corretamente |
| Scripts | ✓ Detectados corretamente | npm scripts extraídos (dev, build, start, lint) |
| Framework principal | ✓ Detectado corretamente | Next.js identificado como main framework |
| Convenções | ✓ Detectadas | TypeScript, App Router conventions identificadas |

### O que Não Detectou

- Nenhum fato relevante perdido

### O que Detectou Incorretamente

- Nada

### O que Gostaríamos que Detectasse

- Nada específico (próximo.js tratado corretamente)

---

## Matriz Comparativa Final (4 Experimentos)

### Tecnologias Detectadas

| Projeto | Esperado | Detectado | Status |
|---------|----------|-----------|--------|
| Harness | TypeScript | TypeScript | ✓ |
| HubCRM | PHP, MVC | [] | ✗ |
| WordPress | PHP, WordPress, npm | [] (npm scripts ok) | ⚠️ Parcial |
| hubdev-pro | React, Next.js, TS | React, Next.js, TS | ✓ |

### Package Manager Detectado

| Projeto | Esperado | Detectado | Status |
|---------|----------|-----------|--------|
| Harness | pnpm | pnpm | ✓ |
| HubCRM | composer (ou unknown) | npm (default) | ✗ |
| WordPress | npm + composer | npm (ignora composer) | ⚠️ |
| hubdev-pro | pnpm | pnpm | ✓ |

### Scripts Detectados

| Projeto | Esperado | Detectado | Status |
|---------|----------|-----------|--------|
| Harness | npm scripts | npm scripts (5) | ✓ |
| HubCRM | PHP scripts (ou none) | [] | ✗ |
| WordPress | npm scripts | npm scripts (11) | ✓ |
| hubdev-pro | npm scripts | npm scripts (4) | ✓ |

### Padrão Claro

**ProjectMetadata funciona corretamente APENAS para Node.js/npm projects.**

- ✓ Harness (Node.js) — 100% accuracy
- ✗ HubCRM (PHP) — 0% accuracy em technologies/package manager
- ⚠️ WordPress (Híbrido) — 50% accuracy (npm scripts ok, mas PHP ignorado)
- ✓ hubdev-pro (Node.js) — 100% accuracy

**Conclusão:**

ProjectMetadata representa corretamente apenas projetos Node.js. Para projetos fora desse ecossistema, retorna valores default incorretos ou incompletos.

---

## Pergunta Arquitetural Fundamental

**A Pergunta Original:** "Qual é a responsabilidade real do ProjectLoader?"

**Resposta baseada em evidência:**

ProjectLoader foi implementado como "Entender Node.js projects em detalhe" mas foi nomeado como "Descobrir fatos universais sobre qualquer projeto".

Isso não é erro de implementação — é decisão de design não examinada.

**Opções:**

1. **Rename + aceitar Node.js-only**: ProjectLoader é "NodeProjectLoader", especializado em Node.js
2. **Abstract package manager detection**: Criar mecanismo plugável para detectar ANY ecossistema
3. **Separate concerns**: ProjectLoader coleta fatos universais, novo componente detecta ecossistema-específico

Nenhuma opção é "correta" — cada uma tem tradeoffs.

**Próximo passo:** Revisar hipótese de "mistura de responsabilidades" com essa evidência. Decidir escopo real de ProjectLoader baseado em realidade observada.

---

**Atualizado:** 2026-07-12 01:48
