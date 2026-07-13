# Harness v0 — Review do Experimento

> Análise final do ciclo de desenvolvimento do Harness v0.
>
> Data de conclusão: 2026-07-13

---

## Objetivo do Experimento

Validar se uma arquitetura modular, baseada em componentes com responsabilidade única e contratos públicos, consegue sustentar um motor de orquestração de papéis organizacionais.

Específico:
- Provar que o pipeline (ProjectLoader → ContextBuilder → WorkflowEngine → RoleRunner → MemoryWriter) funciona end-to-end sem problemas de acoplamento
- Validar que cada componente tem responsabilidade clara e isolável
- Demonstrar que novos papéis podem ser adicionados sem refatorar componentes existentes
- Confirmar que conhecimento reutilizável pode ser extraído e persistido de forma estruturada

---

## O que Foi Implementado

### Componentes Principais

**ProjectLoader**
- Coleta fatos objetivos do projeto: estrutura, tecnologias, scripts, arquivos relevantes
- Detecta package manager (pnpm, yarn, npm)
- Identifica tecnologias (TypeScript, React, Next.js, Express, etc.)
- Extrai scripts disponíveis

**ContextBuilder**
- Lê arquivos relevantes (package.json, tsconfig, CLAUDE.md, README)
- Detecta convenções de projeto (code style, naming, test framework)
- Identifica constraints (falta de scripts, tecnologias não detectadas)
- Estrutura dados em modelo universal (Context)

**WorkflowEngine**
- Orquestra execução do pipeline em sequência
- Captura exceções e interrompe fluxo em caso de falha
- Extrai artifacts de RoleOutput e passa para MemoryWriter
- Imprime status de cada etapa

**Dev Role**
- Analisa projeto usando fatos do Context
- Reporta: tecnologias, scripts, convenções, constraints
- Identifica conhecimento reutilizável (TypeScript convention, pnpm convention, constraints)
- Retorna análise estruturada + lista de artifacts

**RoleRunner**
- Invoca papéis (atualmente apenas Dev)
- Agnóstico da implementação do papel
- Retorna RoleOutput com resultado + artifacts

**MemoryWriter**
- Persiste KnowledgeArtifacts em diretório `memory/`
- Formata cada artifact como arquivo markdown
- Timestamps para rastreabilidade
- Documenta tipo, descrição, contexto e componentes relacionados

### Estado Atual do Pipeline

```
Entrada: (projectPath, objective)
  ↓
ProjectLoader
  → ProjectMetadata (fatos objetivos)
  ↓
ContextBuilder
  → Context (estruturado, sem interpretação além de fatos)
  ↓
RoleRunner → Dev Role
  → RoleOutput { result, artifacts[] }
  ↓
MemoryWriter
  → Arquivos markdown em memory/
  ↓
Saída: Pipeline concluído, conhecimento persistido
```

Pipeline executa sem erros end-to-end. Cada execução gera artifacts persistidos.

---

## Hipóteses Validadas

### ✓ Responsabilidade Única é Viável
Cada componente implementado tem exatamente uma responsabilidade bem definida. Mudanças em um componente não cascateiam.

**Evidência:** M4.1-M4.4 implementados isoladamente, cada um funcionando em isolamento e integrado.

### ✓ Contratos Primeiro Funciona
Definir interfaces antes de implementação força design upfront e evita refatorações em cascata.

**Evidência:** Nenhuma mudança em contrato após M2. Implementações preencheram exatamente o que foi prometido.

### ✓ Agnóstico de Implementação é Possível
Componentes podem ser agnósticos da implementação um do outro, comunicando apenas através de contratos.

**Evidência:** ProjectLoader mudou de stub para real sem afetar ContextBuilder ou outros consumidores. Contrato permaneceu idêntico.

### ✓ Exception-Driven Error Handling é Simples
Lançar exceções e deixar WorkflowEngine tratar é mais simples que status fields.

**Evidência:** Nenhuma verificação de status em cada componente. Falha interrompe imediatamente, com stack trace.

### ✓ Validação Incremental por Milestone Funciona
Cada milestone é completo, executável, testável. Impossível terminar milestone com arquitetura quebrada.

**Evidência:** M1-M4 foram validados independentemente. Cada um deixou pipeline funcionando.

### ✓ Comportamento é Dirigido por Contexto Estruturado

### ✓ Execução Interrompível por Conflito Lógico
O sistema distingue erros de execução (runtime, parsing) de conflitos epistêmicos (regras contraditórias), interrompendo o fluxo graciosamente (fail-fast) ao detectar incoerências estruturais.

**Evidência:** DevRole e ArchitectRole abortam a execução com status `conflict` se detectam regras simultâneas de `allow` e `forbid` para o mesmo alvo (Níveis 6-8).

Roles diferentes podem ser orquestrados por uma única estrutura de decisão (`constraints`, `rules`), separando lógica do contexto sem engines fixas.

**Evidência:** DevRole e ArchitectRole reagem à mesma constraint estruturada (Níveis 2-5).

### ✓ Fatos antes de Interpretação é Viável
ProjectLoader coleta apenas fatos. ContextBuilder estrutura. Dev Role observa. Interpretação pode vir depois.

**Evidência:** Dev Role reporta apenas o que vê. Nenhuma heurística ou raciocínio complexo. Conhecimento é simples (conventions, learnings).

---

## Hipóteses que Permanecem em Aberto

### ? Como Papéis Interact em Paralelo?
v0 executa um papel por vez (Dev). Que acontece quando múltiplos papéis rodam em paralelo?
- Compartilham o mesmo Context?
- Cada um tem Context próprio?
- Há prioridades de execução?

### ? Qual o Escopo de um Role?
Dev Role hoje é análise passiva. Que acontece quando um papel precisa fazer ações (gerar código, executar scripts)?
- Responsibilities mudam?
- Novo componente de execução?
- Transações/rollback necessárias?

### ? Como Evoluir Conhecimento?
MemoryWriter persiste artifacts uma vez. E quando conhecimento precisa ser atualizado?
- Versioning de artifacts?
- Merge de conhecimento contraditório?
- Histórico de evolução?

### ? Feedback Loop
v0 é unidirecional: observa → persiste. E quando um papel precisa de feedback de execução anterior?
- Carrega artifacts do memory/ durante Context Building?
- Há aprendizado acumulativo?

### ? Validação de Artifacts
Dev Role identifica artifacts manualmente. Pode haver critérios objetivos?
- Quando um artifact merece persistência?
- Há "importância" vs. "trivial"?
- Que evita persistência de ruído?

### ? Escalabilidade
Pipeline funciona em um projeto. Que acontece em:
- Projetos gigantes (milhões de linhas)?
- Múltiplos projetos executando simultaneamente?
- Memória acumulada ao longo do tempo?

---

## Lições Aprendidas

### 1. Design-by-Contract Força Clareza
Ao definir contratos primeiro, você é obrigado a responder perguntas arquiteturais ANTES de codificar. Isso elimina refatorações futuras.

### 2. Milestones Incrementais Eliminam Surpresas
Cada milestone pequeno evita descobertas desastrosas no final. Se algo está quebrado, você sabe exatamente onde.

### 3. Responsabilidade Única é Mais Importante que Reutilização
Componentes focados são mais fáceis de entender, testar e modificar. Repetição é aceitável se mantém clareza.

### 4. Fatos vs. Interpretação é uma Divisão Crítica
ProjectLoader coleta fatos. ContextBuilder estrutura. Dev Role observa. Esta divisão simplifica tudo e permite evolução independente.

### 5. Artifacts são Conhecimento, Não Execução
Persistir apenas o que é reutilizável (decisions, patterns, conventions) — não logs, prompts, ou respostas — mantém memória limpa e utilizável.

### 6. TypeScript como Ferramenta de Design
Type-checking detecta incompatibilidades de contrato em compile-time. Interfaces como código são auto-documentação.

### 7. Agnóstico > Especializado (No Início)
Context genérico funciona. Especializar depois quando houver evidência, não antes.

### 8. Uma Coisa Por Vez
Implementar um componente por milestone torna cada impacto isolável e compreensível. Pressa gera refatorações.

---

## Limites do v0

### Escopo Deliberadamente Fora

**Não implementado:**
- Múltiplos Roles em paralelo (apenas Dev)
- Ações mutativas (geração de código, execução de scripts)
- Feedback loop (carregar artifacts anteriores durante Context Building)
- Priorização de artifacts (todos têm mesmo peso)
- Validação de entrada (assume input válido)
- Configuração dinâmica (paths hardcoded)
- Logging estruturado (apenas console.log)
- Testes automatizados (apenas execução manual)
- Tratamento de edge cases (falha rápido)
- Autenticação/autorização

**Razão:** YAGNI. v0 é experimento. Hipóteses devem emergir da prática, não ser especuladas.

### Decisões Temporárias

- Artifacts extraídos manualmente por Dev (pode ser automatizado depois)
- Memory directory hardcoded (pode ser configurável)
- Console.log para diagnostics (pode usar logger estruturado)
- Markdown para artifacts (pode ser JSON, database)

---

## Próximos Experimentos Sugeridos

O objetivo agora é validar o Harness em **projetos reais**. Apenas três experimentos são prioritários:

### Prioridade 1: Validação em Projetos Reais
**Experimento:** Executar Harness em 3-5 projetos diferentes (Node.js, Next.js, Python, etc.).
- **Questão:** ProjectLoader detecta corretamente? ContextBuilder captura convenções? Dev Role análise é útil?
- **Escopo:** Rodar Harness, verificar artifacts gerados, avaliar qualidade.
- **Saída:** Hipóteses validadas ou refutadas através de evidência prática.

### Prioridade 2: Artifact Quality Validation
**Experimento:** Avaliar se conhecimento persistido é relevante e correto.
- **Questão:** Artifacts gerados refletem realidade do projeto? São úteis para futuras análises?
- **Escopo:** Executar Harness, revisar memory/, avaliar se descobertas são acuradas.
- **Saída:** Entendimento de quando artifacts são valiosos vs. ruído.

### Prioridade 3: Scalability Testing
**Experimento:** Testar em projetos grandes (10k+ LOC, centenas de arquivos).
- **Questão:** Pipeline mantém performance? Memory usage razoável? Artifacts úteis em projetos grandes?
- **Escopo:** Executar Harness em projeto grande, medir tempo e recursos.
- **Saída:** Gargalos identificados, viabilidade em escala validada.

---

## Conclusão

Harness v0 validou a arquitetura base. O pipeline funciona, componentes têm responsabilidades claras, e conhecimento pode ser extraído e persistido.

O experimento confirma que uma abordagem incremental, baseada em contratos e milestones, é viável para sistemas complexos. A próxima fase é validar extensibilidade real: múltiplos Roles, ações mutativas, feedback loops.

Recomendação: Próxima conversa começa com Prioridade 1 (Execução de Ações), que desbloqueará Prioridades 2 e 3.

---

## Histórico de Milestones

| Milestone | Objetivo | Status |
|-----------|----------|--------|
| M1 | Bootstrap (deps, build, type-check) | ✓ Completo |
| M2 | Contratos (interfaces sem impl) | ✓ Completo |
| M3 | Pipeline com stubs | ✓ Completo |
| M4.1 | ProjectLoader real | ✓ Completo |
| M4.2 | ContextBuilder real | ✓ Completo |
| M4.3 | Dev Role + RoleRunner real | ✓ Completo |
| M4.4 | MemoryWriter real | ✓ Completo |

**Duração total:** Uma conversa de trabalho focado.

**Artifacts:** Code (6 components), Docs (3 files: ARCHITECTURE_METHOD, ARCHITECTURE_DECISIONS, HARNESS_V0_REVIEW).

**Próxima ação:** Iniciar novo ciclo com Prioridade 1 ou aguardar feedback.
