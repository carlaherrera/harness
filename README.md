# Harness

An experimental orchestration engine for organizational roles. Validates a modular architecture that coordinates execution of distinct organizational behaviors (Dev, QA, Product, etc.) without tight coupling.

**Current Status:** v0 — Architecture validated through implementation. Pipeline executes end-to-end. Ready for testing on real projects.

**Repository:** https://github.com/carlaherrera/harness

---

## What This Is

Harness v0 is an architecture experiment, not a production system. The goal is to validate:

- Whether component separation (ProjectLoader, ContextBuilder, WorkflowEngine, RoleRunner, MemoryWriter) can scale to multiple roles
- Whether context-driven role execution works without hardcoding project-specific logic
- Whether knowledge can be extracted and persisted in a structured way
- Whether the pipeline remains extensible as new roles are added

The project has been incrementally designed, implemented, and tested. See `docs/ARCHITECTURE_DECISIONS.md` for design rationale (10 ADRs).

---

## Getting Started

### Installation

```bash
git clone https://github.com/carlaherrera/harness.git
cd harness
pnpm install
```

### Build & Run

```bash
# Compile TypeScript
pnpm build

# Execute Dev role on a project
node dist/cli.js dev . -o "Analyze project structure"

# With watch mode during development
pnpm dev
```

### Command

```bash
node dist/cli.js dev <projectPath> -o "<objective>"
```

Options:
- `<projectPath>` — Path to project directory (default: current directory)
- `-o, --objective <text>` — Objective for the Dev role (default: "Analyze project structure")

### Logging

Pipeline logs via **pino**:

- **Dev environment:** Colorized, human-readable output
- **Production:** JSON-formatted structured logs (machine-parseable)

Control logging:

```bash
# Debug level (verbose)
LOG_LEVEL=debug node dist/cli.js dev .

# Info level (default)
node dist/cli.js dev .

# Production mode (JSON)
NODE_ENV=production node dist/cli.js dev .
```

### Example Run

```bash
$ pnpm build
$ node dist/cli.js dev . -o "Validate architecture"

[2026-07-12 01:17:58.160 -0300] INFO: Pipeline starting
    projectPath: "."
    objective: "Validate architecture"

[2026-07-12 01:17:58.160 -0300] INFO: Loading project
    path: "."

[2026-07-12 01:17:58.163 -0300] INFO: Project identified
    technologies: ["TypeScript"]
    packageManager: "pnpm"
    scriptsCount: 5

[2026-07-12 01:17:58.164 -0300] INFO: Building context
    objective: "Validate architecture"

[2026-07-12 01:17:58.165 -0300] INFO: Context built
    filesLoaded: 4
    conventionsDetected: 1
    constraintsIdentified: 2

[2026-07-12 01:17:58.165 -0300] INFO: Running role
    role: "dev"

[2026-07-12 01:17:58.168 -0300] INFO: All artifacts persisted
    count: 3

[2026-07-12 01:17:58.168 -0300] INFO: Pipeline complete
    status: "success"
```

Artifacts are written to `memory/` directory.

---

## Architecture

The pipeline executes in sequence:

1. **ProjectLoader** — Reads project structure, detects technologies, extracts scripts, collects relevant files. Returns factual metadata.

2. **ContextBuilder** — Reads files identified by ProjectLoader. Detects conventions (TypeScript, React, pytest, etc.). Identifies constraints (missing scripts, unknown tech). Structures all information into a Context object.

3. **WorkflowEngine** — Orchestrates the pipeline. Invokes RoleRunner, extracts artifacts from RoleOutput, passes to MemoryWriter. Handles exceptions; fails fast.

4. **RoleRunner** — Executes a role (currently only Dev). Agnóstic of role implementation. Returns RoleOutput with result and optional artifacts.

5. **Dev Role** — Analyzes the project using facts from Context. Identifies conventions, reports constraints, extracts knowledge artifacts. Returns analysis result and discoveries.

6. **MemoryWriter** — Persists artifacts to `memory/` directory as timestamped markdown files. One artifact type per file. Enables future feedback loops.

For architecture rationale, see `docs/ARCHITECTURE_DECISIONS.md`.

---

## What Works

- End-to-end pipeline execution without errors
- ProjectLoader correctly detects technologies and project metadata
- ContextBuilder structures facts into Context
- Dev Role analyzes using Context facts
- MemoryWriter persists artifacts with proper formatting
- Logging provides visibility into each stage
- Type safety via TypeScript strict mode

## What's Not Implemented

- Multiple roles executing in parallel
- Actions/mutations (code generation, script execution)
- Feedback loop (loading previous artifacts during analysis)
- Artifact prioritization or filtering
- Automated tests
- Configuration beyond hardcoding
- Authentication/authorization
- Database integration for artifacts

See `docs/HARNESS_V0_REVIEW.md` for full scope and limitations.

---

## How to Test

### Verify Pipeline Execution

```bash
pnpm build
node dist/cli.js dev . -o "Test"
```

Should complete without errors and produce logs.

### Check Artifacts

```bash
ls -la memory/
cat memory/*.md
```

Should contain convention and learning artifacts formatted as markdown.

### Test on Different Projects

```bash
# Node.js project
node dist/cli.js dev ~/my-node-project -o "Analyze"

# Next.js project
node dist/cli.js dev ~/my-nextjs-project -o "Analyze"

# Python project
node dist/cli.js dev ~/my-python-project -o "Analyze"
```

ProjectLoader should detect different technologies and ContextBuilder should identify relevant conventions.

---

## Project Contents

### Source Code

```
src/
  core/
    contracts/        # Interface definitions
    project-loader/   # ProjectLoader implementation
    context-builder/  # ContextBuilder implementation
    workflow-engine/  # WorkflowEngine implementation
    role-runner/      # RoleRunner implementation
    memory-writer/    # MemoryWriter implementation
  roles/
    dev/              # Dev role implementation
  utils/
    logger.ts         # Pino logging setup
  cli.ts              # CLI entry point
```

### Documentation

- `README.md` — This file
- `docs/ARCHITECTURE_METHOD.md` — Methodology for architecture design (reusable)
- `docs/ARCHITECTURE_DECISIONS.md` — 10 ADRs documenting design choices
- `docs/HARNESS_V0_REVIEW.md` — Review of v0 experiment: validation, limitations, open questions
- `CLAUDE.md` — Project configuration

### Configuration

- `package.json` — Dependencies (commander, pino, zod), scripts
- `tsconfig.json` — TypeScript strict mode enabled
- `.eslintrc.js` — Linting configuration
- `.prettierrc` — Code formatting
- `.gitignore` — Standard Node.js ignores + memory/

---

## Next Steps

The current goal is **validation on real projects**. Run Harness on your actual projects and observe:

- Does ProjectLoader correctly identify your tech stack?
- Does ContextBuilder capture relevant conventions?
- Does Dev Role analysis align with your expectations?
- Are artifacts meaningful and reusable?

Document findings. Use findings to inform which hypotheses hold and which need revision.

Specific experiments (prioritized by real-world validation need):

1. **Use in production projects** — Test on 3-5 different real projects. What assumptions break? What works?

2. **Verify artifact quality** — Are persisted discoveries actually useful? Are they correct?

3. **Test scalability** — Large projects (10k+ LOC). Performance and memory behavior.

Detailed next steps are in `docs/HARNESS_V0_REVIEW.md`.

---

## Architecture Design Method

This project follows a specific methodology for architecture:

- **Design-by-contract** — Interfaces first, implementations second
- **Incremental validation** — Milestones that produce working systems
- **No premature abstraction** — Patterns must be observed, not predicted
- **One component per iteration** — Changes are isolatable

This method is documented in `docs/ARCHITECTURE_METHOD.md` for reuse in other projects.

---

## Built With

- Node.js
- TypeScript (strict mode)
- Commander (CLI)
- Zod (schema validation)
- Pino (structured logging)
- Pino-pretty (dev logging)

---

## Limitations

This is an experiment. Known limitations:

- Single role (Dev) implemented
- No persistent storage (artifacts written to filesystem)
- No configuration system
- No multi-tenant support
- No feedback loop (artifacts not loaded on future runs)
- Performance not optimized

See `docs/HARNESS_V0_REVIEW.md` section "Limites do v0" for full list.

---

## Contributing

This is a research project. Before proposing changes:

1. Understand the architecture: Read `docs/ARCHITECTURE_DECISIONS.md`
2. Understand the method: Read `docs/ARCHITECTURE_METHOD.md`
3. Validate assumptions: Test on real projects first
4. Document findings: Update `docs/HARNESS_V0_REVIEW.md` with evidence

Changes should be driven by real evidence, not speculation.

---

## Feedback

Questions, observations, or results from testing on real projects?

Open an issue: https://github.com/carlaherrera/harness/issues

---

**Maintainer:** Carla Herrera <contato@carlaherrera.com.br>

**Updated:** 2026-07-12
