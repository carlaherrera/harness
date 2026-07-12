# Harness v0

## Objetivo

Motor reutilizável de orquestração de papéis organizacionais.

## Stack

- Node.js + TypeScript
- PNPM
- Commander (CLI)
- Zod (validação)

## Arquitetura

Pipeline: Project Loader → Context Builder → Workflow Engine → Role Runner → Memory Writer

Cada componente tem responsabilidade única. Falhas são exceções, não resultados.

## Milestones

- M1: Bootstrap (✓ em progresso)
- M2: Contratos públicos
- M3: Pipeline com stubs
- M4: Evoluir componentes

## Comandos

- `pnpm dev` — executar com watch
- `pnpm build` — compilar TypeScript
- `pnpm lint` — verificar ESLint
- `pnpm format` — formatar Prettier
- `pnpm type-check` — verificar tipos

Atualizado: 2026-07-11 00:00
