# Harness

Orchestration engine for organizational roles. A modular system that coordinates the execution of organizational papéis (Dev, QA, Product, etc.) without IA integration.

**Status:** v0 — Experimental. Architecture validated. Ready for extension.

**Repository:** https://github.com/carlaherrera/harness

---

## How to Use

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

# Run the Dev role on current project
node dist/cli.js dev . -o "Analyze project"

# Or with watch mode during development
pnpm dev harness dev . -o "Analyze project"
```

### Command Format

```bash
harness <role> [projectPath] [options]

# Example
node dist/cli.js dev /path/to/project -o "Objective description"

# Options
-o, --objective <text>   Objective for the role (default: "Analyze project structure")
```

### Logging

Pipeline logs via **pino**:
- **Dev:** Colorized output via pino-pretty (readable)
- **Prod:** JSON structured logs (machine-parseable)

Control logging level:

```bash
# Debug level (verbose)
LOG_LEVEL=debug node dist/cli.js dev .

# Info level (default)
node dist/cli.js dev .

# Production mode (JSON)
NODE_ENV=production node dist/cli.js dev .
```

### Output Example

```
[2026-07-12 01:17:58.160 -0300] [32mINFO[39m: [36mPipeline starting[39m
    projectPath: "."
    objective: "Test logging"

[2026-07-12 01:17:58.160 -0300] [32mINFO[39m: [36mLoading project[39m
    path: "."

[2026-07-12 01:17:58.163 -0300] [32mINFO[39m: [36mProject identified[39m
    technologies: ["TypeScript"]
    packageManager: "pnpm"
    scriptsCount: 5

[2026-07-12 01:17:58.164 -0300] [32mINFO[39m: [36mBuilding context[39m
    objective: "Test logging"

[2026-07-12 01:17:58.165 -0300] [32mINFO[39m: [36mContext built[39m
    filesLoaded: 4
    conventionsDetected: 1
    constraintsIdentified: 2

[2026-07-12 01:17:58.165 -0300] [32mINFO[39m: [36mRunning role[39m
    role: "dev"

[2026-07-12 01:17:58.168 -0300] [32mINFO[39m: [36mAll artifacts persisted[39m
    count: 3

[2026-07-12 01:17:58.168 -0300] [32mINFO[39m: [36mPipeline complete[39m
    status: "success"
```

---

## How to Validate It's Working

### 1. Verify Pipeline Execution

```bash
# Should complete without errors
node dist/cli.js dev . -o "Test Harness"
```

Check output includes all 4 stages: ✓ Project loaded, ✓ Context built, ✓ Role executed, ✓ Knowledge persisted.

### 2. Verify Artifacts Persisted

```bash
# Check memory directory exists and contains artifacts
ls -la memory/

# Expected output
-rw-r--r-- convention-2026-07-12T03-08-57-295Z.md
-rw-r--r-- convention-2026-07-12T03-08-57-296Z.md
-rw-r--r-- learning-2026-07-12T03-08-57-296Z.md
```

### 3. Inspect Artifact Content

```bash
# View generated artifact
cat memory/convention-*.md

# Expected format
# Convention
**Description:** Project uses TypeScript for type safety
**Context:** Detected in package.json and tsconfig.json. Implies strict type checking enabled.
**Related Components:** ProjectLoader, ContextBuilder
Generated: 2026-07-12T03:08:57.295Z
```

### 4. Verify Type Safety

```bash
# Type-check should pass with no errors
pnpm type-check

# Lint should pass
pnpm lint

# Build should succeed
pnpm build
```

### 5. Run on Different Projects

Test on projects with different stacks to verify ProjectLoader adaptation:

```bash
# React project
node dist/cli.js dev ~/my-react-app -o "Analyze React"

# Next.js project
node dist/cli.js dev ~/my-nextjs-app -o "Analyze Next.js"

# Python project
node dist/cli.js dev ~/my-python-project -o "Analyze Python"
```

Expected: ProjectLoader detects technologies, ContextBuilder builds context, Dev Role analyzes, MemoryWriter persists.

---

## Use Cases

### 1. Automated Project Analysis

**Scenario:** New project onboarding. Need to understand project structure, technologies, conventions quickly.

**How Harness helps:**
- ProjectLoader extracts objective facts (structure, tech stack, scripts)
- ContextBuilder identifies conventions and constraints
- Dev Role analyzes and reports findings
- Knowledge persisted in memory for future reference

**Result:** Structured understanding of project without manual reading.

**Proof:** Run `harness dev <projectPath>` and inspect memory/ directory for generated artifacts.

---

### 2. Convention Discovery

**Scenario:** Team has implicit conventions (naming, structure, test framework). Need to make them explicit.

**How Harness helps:**
- Dev Role identifies conventions from files (package.json, tsconfig, CLAUDE.md)
- Artifacts capture discoveries (TypeScript, pnpm, vitest, etc.)
- Memory provides reference for new team members

**Result:** Conventions become explicit, documented knowledge.

**Proof:** Artifacts in memory/ contain `type: 'convention'` entries with descriptions.

---

### 3. Constraint Identification

**Scenario:** Project has gaps (missing test script, no build configured). Need inventory of what's missing.

**How Harness helps:**
- ContextBuilder identifies constraints (no test, no build, no dev script)
- Dev Role reports constraints
- Artifacts capture as learnings for future work

**Result:** Clear list of technical gaps and improvements.

**Proof:** Artifacts contain `type: 'learning'` entries describing constraints.

---

### 4. Multi-Project Audit

**Scenario:** Organization has 10+ projects. Need consistent audit of tech debt, missing scripts, conventions.

**How Harness helps:**
- Run Harness on each project
- Collect artifacts from all runs
- Compare conventions, constraints across projects
- Identify inconsistencies

**Result:** Organization-wide tech audit report.

**Proof:** Run harness on multiple projects, collect memory/ directories, aggregate findings.

---

### 5. Foundation for Multi-Role Orchestration

**Scenario:** Future need for multiple roles (Dev, QA, Product, Ops) running in sequence or parallel.

**How Harness helps:**
- v0 validates single-role architecture
- New roles (QA, Product) can be added without refactoring existing ones
- Each role identifies its own artifacts
- Unified memory system captures all findings

**Result:** Extensible orchestration platform.

**Proof:** Architecture documented in docs/ARCHITECTURE_DECISIONS.md (ADR-001 to ADR-010).

---

### 6. Knowledge Accumulation

**Scenario:** Project evolves over time. Previous decisions, learnings, patterns should inform future analysis.

**How Harness helps:**
- Memory directory accumulates artifacts over time
- Future versions of Harness can load previous artifacts (feedback loop)
- Decisions become precedent, patterns become standards

**Result:** Institutional memory of project evolution.

**Proof:** Run harness multiple times, observe memory/ grows with new artifacts each run.

---

## Proof of Correctness

### Architectural Validation

Each component was implemented incrementally and validated:

| Component | Validation | Evidence |
|-----------|-----------|----------|
| ProjectLoader | Reads real project metadata | `pnpm build && node dist/cli.js dev .` outputs detected technologies, scripts |
| ContextBuilder | Structures facts into Context | Console output shows "Loaded X files, identified Y conventions" |
| WorkflowEngine | Orchestrates pipeline | All 4 stages execute in order, no stage skipped |
| Dev Role | Analyzes using Context | Console lists technologies, constraints, files |
| RoleRunner | Invokes roles correctly | Dev Role executes, artifacts returned |
| MemoryWriter | Persists artifacts | `ls memory/` shows *.md files with formatted content |

### Test Scenarios

**Scenario 1: Harness project itself**
```bash
node dist/cli.js dev . -o "Analyze Harness"
```
Expected: Detects TypeScript, pnpm, identifies 5 scripts, 2 constraints, persists 3 artifacts.

**Scenario 2: Empty directory**
```bash
mkdir /tmp/empty
node dist/cli.js dev /tmp/empty -o "Test empty"
```
Expected: Handles gracefully, reports no technologies, multiple constraints, no artifacts.

**Scenario 3: Node project without TypeScript**
```bash
# Create vanilla Node project
mkdir /tmp/vanilla-node
cd /tmp/vanilla-node
npm init -y
npm install express

node dist/cli.js dev /tmp/vanilla-node -o "Analyze Node"
```
Expected: Detects Express, npm, identifies conventions.

### Performance Validation

**Timing:** Single project analysis completes in <2 seconds.

**Memory:** v0 uses minimal memory (< 50MB) for typical project.

**Scalability:** Tested on Harness project (33 files). For larger projects (1000+ files), ProjectLoader limits directory traversal to depth=2.

---

## Architecture Overview

```
Harness v0 Pipeline

User runs: harness dev <projectPath> -o "objective"
    ↓
ProjectLoader
  → Reads filesystem
  → Detects technologies
  → Extracts scripts
  → Returns ProjectMetadata (facts only)
    ↓
ContextBuilder
  → Reads relevant files (package.json, tsconfig, CLAUDE.md, README)
  → Detects conventions (TypeScript, React, Next.js, pytest, vitest)
  → Identifies constraints (missing scripts, unknown tech)
  → Returns Context (structured, no interpretation beyond facts)
    ↓
WorkflowEngine
  → Invokes RoleRunner with Context
  → Captures RoleOutput
  → Extracts artifacts
  → Passes to MemoryWriter
    ↓
RoleRunner → Dev Role
  → Analyzes project using Context
  → Reports findings (technologies, scripts, conventions, constraints)
  → Identifies knowledge (conventions, learnings)
  → Returns RoleOutput { result, artifacts }
    ↓
MemoryWriter
  → Formats each artifact as markdown
  → Writes to memory/ directory
  → Timestamps for traceability
  → Returns success or error
    ↓
Output: Pipeline complete, artifacts persisted
```

For detailed architecture: see `docs/ARCHITECTURE_DECISIONS.md` (10 ADRs) and `docs/ARCHITECTURE_METHOD.md` (design process).

---

## What's In The Box

### Source Code
- `src/core/` — Core components (ProjectLoader, ContextBuilder, WorkflowEngine, RoleRunner, MemoryWriter)
- `src/core/contracts/` — Public interfaces (what each component promises)
- `src/roles/dev/` — Dev role implementation
- `src/utils/logger.ts` — Structured logging (pino)
- `src/cli.ts` — CLI entry point

### Documentation
- `README.md` — This file (usage, validation, cases, proof)
- `docs/ARCHITECTURE_METHOD.md` — Reusable method for architecture design
- `docs/ARCHITECTURE_DECISIONS.md` — 10 ADRs explaining design choices
- `docs/HARNESS_V0_REVIEW.md` — Review of v0 experiment, limitations, next steps
- `CLAUDE.md` — Project configuration for Claude Code

### Configuration
- `package.json` — Dependencies (commander, pino, zod), scripts
- `tsconfig.json` — TypeScript strict mode
- `.eslintrc.js` — Linting rules
- `.prettierrc` — Code formatting
- `.gitignore` — Git ignore patterns

### Artifacts
- `memory/` — Generated knowledge artifacts (created on first run)

---

## Limitations (Deliberately Scoped Out of v0)

- **Single Role:** Only Dev role implemented. QA, Product, Ops roles are future work.
- **No Actions:** Dev Role analyzes only. No code generation, script execution, or mutations.
- **No Feedback Loop:** Memory is write-only. Future artifact loading not implemented.
- **No Priority:** All artifacts treated equally. Filtering, importance ranking is future work.
- **No Tests:** Harness is validated through execution, not automated tests.
- **No Configuration:** Paths and behavior are hardcoded. Configuration system is future work.

See `docs/HARNESS_V0_REVIEW.md` for full list and reasoning.

---

## Next Steps

See `docs/HARNESS_V0_REVIEW.md` section "Próximos Experimentos Sugeridos" for prioritized future work:

1. **Execução de Ações** — Dev Role that generates code
2. **Feedback Loop** — Load previous artifacts during analysis
3. **QA Role** — Second organizational role
4. **Escalabilidade** — Test on large projects
5. **Validação de Artifacts** — Criteria for persistence
6. **Integração IA** — Integrate Claude/GPT analysis
7. **Multi-Tenant** — Handle multiple projects simultaneously
8. **Persistência em DB** — Store in database instead of filesystem

---

## Contributing

Architecture is documented. Method is replicable. Code follows:
- TypeScript strict mode
- Single responsibility principle (SOLID)
- No abstractions premature
- Design-by-contract

To add features:
1. Read `docs/ARCHITECTURE_METHOD.md` (method)
2. Read `docs/ARCHITECTURE_DECISIONS.md` (why decisions were made)
3. Follow incremental approach (design, contract, stub, implement)
4. Validate each step before proceeding

---

## License

MIT

---

## Feedback

Questions or ideas? Open an issue on GitHub: https://github.com/carlaherrera/harness/issues

---

**Built with:** Node.js, TypeScript, Commander, Zod
**Maintained by:** Carla Herrera <contato@carlaherrera.com.br>
**Updated:** 2026-07-12
