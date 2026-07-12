# Harness v0

## Objetivo

Motor reutilizável de orquestração de papéis organizacionais. Coordena a execução de papéis (Dev, QA, Product, etc.) sem integração com IA.

## Status

✓ v0 completo. Arquitetura validada. Ciclo de descoberta conceitual encerrado.

**Ponto de entrada ao retomar:** `docs/PROJECT_STATE.md` (âncora — estado, próximo ciclo, ponto de retomada).

Último ciclo produziu o **Radar Arquitetural** (`docs/ARCHITECTURAL_RADAR.md`): 7 oportunidades de melhoria descobertas por análise epistemológica do pipeline. É referência, não backlog — revisitar quando surgirem organicamente. Única decisão firme: ContextBuilder organiza, Roles interpretam (`docs/ARCHITECTURAL_DECISION_CONTEXT_RESPONSIBILITY.md`).

## Stack

- Node.js + TypeScript (strict mode)
- PNPM (package manager)
- Commander (CLI)
- Zod (validação de schemas)
- Pino (structured logging)
- Pino-pretty (dev logging colorido)

## Arquitetura

Pipeline de orquestração:

```
Input: (projectPath, objective)
  ↓
ProjectLoader (coleta fatos)
  ↓
ContextBuilder (estrutura contexto)
  ↓
WorkflowEngine (orquestra fluxo)
  ↓
RoleRunner → Dev Role (analisa)
  ↓
MemoryWriter (persiste knowledge)
  ↓
Output: artifacts em memory/
```

Cada componente tem responsabilidade única. Falhas são exceções. Documentação: `docs/ARCHITECTURE_DECISIONS.md` (10 ADRs).

## Diretrizes de Desenvolvimento

**Antes de propor novos componentes, abstrações ou camadas arquiteturais:**

Verifique se existe **evidência prática suficiente** para justificar a criação.

- Não especule sobre padrões futuros. Implemente quando observado em 2+ casos reais.
- Não adicione componentes "que podem ser úteis depois". YAGNI.
- Cada adição deve resolver um problema documentado, não um potencial.
- Use Harness em projetos reais. Deixe os problemas emergirem. Depois, projete soluções.

Padrão: observar → documentar → projetar → implementar.

## Desenvolvimento

### Scripts

- `pnpm install` — instalar dependências
- `pnpm build` — compilar TypeScript
- `pnpm dev` — executar com watch
- `pnpm type-check` — verificar tipos
- `pnpm lint` — verificar ESLint
- `pnpm format` — formatar Prettier

### Execução

```bash
# Build
pnpm build

# Test
node dist/cli.js dev . -o "Test objective"

# Com logging debug
LOG_LEVEL=debug node dist/cli.js dev .

# Production (JSON logs)
NODE_ENV=production node dist/cli.js dev .
```

## Estrutura

```
src/
  core/
    contracts/        # Interfaces públicas
    project-loader/   # Extrai fatos do projeto
    context-builder/  # Estrutura contexto
    workflow-engine/  # Orquestra pipeline
    role-runner/      # Executa papéis
    memory-writer/    # Persiste artifacts
  roles/
    dev/              # Dev role (único em v0)
  utils/
    logger.ts         # Logging com pino
  cli.ts              # CLI entry point

docs/
  ARCHITECTURE_METHOD.md      # Método reutilizável
  ARCHITECTURE_DECISIONS.md   # 10 ADRs do design
  HARNESS_V0_REVIEW.md        # Review, limites, próximos passos

memory/               # Artifacts gerados (criado em runtime)
```

## Milestones Completos

- M1: Bootstrap ✓
- M2: Contratos ✓
- M3: Pipeline com stubs ✓
- M4.1: ProjectLoader real ✓
- M4.2: ContextBuilder real ✓
- M4.3: Dev Role + RoleRunner real ✓
- M4.4: MemoryWriter real ✓
- Logging: Pino estruturado ✓

## Próximos Experimentos

Ver `docs/HARNESS_V0_REVIEW.md` seção "Próximos Experimentos Sugeridos" (8 prioridades).

Atualizado: 2026-07-12 03:30
