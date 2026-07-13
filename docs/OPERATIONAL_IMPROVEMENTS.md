# Operational Improvements v0 — Test & Usage Guide

**Atualizado:** 2026-07-13 01:44

## Resumo

Implementadas três melhorias operacionais mínimas (sem alterar arquitetura):

1. **Observabilidade de execução** — logs estruturados de Role + Execution Snapshot
2. **Execution Snapshot** — registro simples (JSON) por execução
3. **Knowledge Registry + Manual Reuse** — permite testar reuso manual de artifacts

## 1. Observabilidade Melhorada

### O que foi adicionado

- Logs estruturados no WorkflowEngine indicando:
  - Início/fim da pipeline (`▶ PIPELINE START` / `◀ PIPELINE COMPLETE`)
  - Cada estágio numerado (`[1/4] ProjectLoader`, etc.)
  - Cada Role claramente marcado: `├─ Executing: DEV` / `└─ DEV done`
  - Contagem de artifacts por Role
  - Duração total em ms

### Visualização

```
▶ PIPELINE START
  [1/4] ProjectLoader
  [2/4] ContextBuilder
  [3/4] RoleRunner
    ├─ Executing: DEV
    └─ DEV done (3 artifacts, 1ms)
  [4/4] ExecutionSnapshot
◀ PIPELINE COMPLETE
  status: success
  rolesExecuted: 1
  totalArtifacts: 3
  durationMs: 11
```

### Como testar

```bash
node dist/cli.js dev . -o "Test observability"
```

Verificar logs estruturados com:
- Timestamps ISO
- Role names claros
- Artifact counts
- Duration tracking

---

## 2. Execution Snapshot

### O que foi adicionado

Cada execução agora registra um **snapshot JSON** em `memory/snapshots/`:

```json
{
  "id": "exec-2026-07-13T04-42-28-311Z",
  "timestamp": "2026-07-13T04:42:28.311Z",
  "projectPath": ".",
  "objective": "Test observability features",
  "rolesExecuted": ["dev"],
  "artifactCount": 3,
  "artifacts": [
    {"role": "dev", "filename": "convention-2026-07-13T04-42-28-309Z.md"},
    {"role": "dev", "filename": "convention-2026-07-13T04-42-28-310Z.md"},
    {"role": "dev", "filename": "learning-2026-07-13T04-42-28-310Z.md"}
  ],
  "status": "success",
  "durationMs": 11
}
```

### Propósito

- Rastrear execuções para histórico
- Permitir análise retrospectiva (feedback loop)
- Validar reuso de artifacts em ciclos posteriores

### Como testar

Executar pipeline:
```bash
node dist/cli.js dev . -o "Test snapshot"
```

Verificar snapshot:
```bash
cat memory/snapshots/exec-*.json | jq .
```

Listar todas as execuções:
```bash
ls -la memory/snapshots/
```

---

## 3. Knowledge Registry + Manual Artifact Reuse

### O que foi adicionado

**Knowledge Registry** (`src/core/knowledge-registry/`) cataloga todos os artifacts persistidos:

```
memory/
├── snapshots/          # Execution snapshots
├── registry/           # Index de artifacts conhecidos
│   └── know-*.json
└── *.md                # Artifacts (convention, decision, etc.)
```

**Reuso manual:** CLI aceita `--artifact` para passar conhecimento previo:

```bash
# Executar com artifact anterior como contexto
node dist/cli.js dev . -o "Analyze improvements" \
  --artifact convention-2026-07-13T04-43-46-218Z.md
```

### Como testar

**Passo 1:** Gerar primeira execução e coletar filename

```bash
node dist/cli.js dev . -o "First run"
```

Outputs logs como:
```
[INFO] Artifact persisted
  filename: "convention-2026-07-13T04-43-46-218Z.md"
```

**Passo 2:** Verificar arquivo

```bash
ls memory/convention-*.md | head -1
cat memory/convention-2026-07-13T04-43-46-218Z.md
```

**Passo 3:** Reusar em execução subsequente

```bash
node dist/cli.js dev . -o "Second run with previous knowledge" \
  --artifact convention-2026-07-13T04-43-46-218Z.md
```

**Passo 4:** Verificar logs de carga

Procurar:
```
📖 Loading contextual artifact for manual knowledge reuse
✓ Artifact loaded successfully
```

**Passo 5:** Comparar snapshots

```bash
diff <(jq .artifacts memory/snapshots/exec-*.json | sort) \
     <(jq .artifacts memory/snapshots/exec-*.json | sort)
```

---

## Estrutura de Componentes Adicionados

### ExecutionSnapshot

**Arquivo:** `src/core/execution-snapshot/execution-snapshot.ts`

Responsabilidades:
- Registrar metadata de cada execução
- Salvar como JSON em `memory/snapshots/`
- Suportar listagem e busca de snapshots anteriores

```typescript
async record(data): Promise<ExecutionRecord>
async listSnapshots(): Promise<ExecutionRecord[]>
async getLatest(): Promise<ExecutionRecord | null>
```

### KnowledgeRegistry

**Arquivo:** `src/core/knowledge-registry/knowledge-registry.ts`

Responsabilidades:
- Catalog de artifacts (tipo, descrição, contexto)
- Busca por tipo ou ID
- Carregamento de conteúdo de artifact para reuso

```typescript
async scan(): Promise<RegisteredKnowledge[]>
async register(artifact, filename, source): Promise<RegisteredKnowledge>
async findByType(type): Promise<RegisteredKnowledge[]>
async loadArtifactContent(filename): Promise<string | null>
```

### WorkflowEngine (estendido)

**Arquivo:** `src/core/workflow-engine/workflow-engine.ts`

Mudanças:
- Integra ExecutionSnapshot após cada pipeline
- Integra KnowledgeRegistry para registrar artifacts
- Adiciona `executeWithContext()` para reuso manual
- Melhora logs com marcadores visuais

---

## Não foi feito (por design)

- ❌ Busca automática de artifacts
- ❌ Matching de contexto automático
- ❌ Injeção de artifact no ContextBuilder
- ❌ Refatoração do pipeline
- ❌ Sistema de memória persistente
- ❌ ML/ranking de relevância

**Razão:** Validar se a estrutura funciona **manualmente** antes de qualquer inteligência.

---

## Próximos Passos para Feedback Loop

Com essas bases, é possível:

1. **Executar ciclos** com diferentes objetivos
2. **Comparar snapshots** para entender evolução
3. **Reusar artifacts** manualmente e observar impacto
4. **Decidir** se automação de reuso é necessária (ou não)

---

## Troubleshooting

### Artifact não encontrado
```
⚠ Artifact not found or unreadable
```
Verificar:
- Filename exato em `memory/`
- Permissões do arquivo
- Path relativo vs. absoluto

### Snapshot vazio
Se `artifactCount: 0`, role não gerou artifacts. Verificar:
- Role está produzindo output esperado?
- Artifacts têm conteúdo válido?

### Logs silenciosos
```bash
LOG_LEVEL=debug node dist/cli.js dev .
```

---

## Diagrama de Fluxo

```
EXECUÇÃO 1
  ├─ input: (projectPath, objective)
  ├─ pipeline → artifacts
  ├─ MemoryWriter salva em memory/*.md
  ├─ KnowledgeRegistry cataloga em memory/registry/
  └─ ExecutionSnapshot registra em memory/snapshots/

EXECUÇÃO 2 (com reuso manual)
  ├─ input: (projectPath, objective, --artifact X.md)
  ├─ KnowledgeRegistry carrega X.md
  ├─ WorkflowEngine.executeWithContext() inicia pipeline
  ├─ contextualArtifact fica disponível (não injetado ainda)
  ├─ pipeline → novos artifacts
  ├─ MemoryWriter salva em memory/*.md
  ├─ KnowledgeRegistry cataloga
  └─ ExecutionSnapshot registra (com histórico para comparar)
```

---

## Verificação Final

Após implementação, confirmar:

- [x] Build clean (pnpm build)
- [x] CLI aceita `--artifact` flag
- [x] Logs estruturados aparecem
- [x] Snapshots JSON salvos corretamente
- [x] Knowledge registry cataloga artifacts
- [x] Reuso manual carrega artifact
- [x] Teste com múltiplas execuções

