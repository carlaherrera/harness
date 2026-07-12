# Architecture Decisions — Harness v0

> Registro de decisões arquiteturais tomadas durante desenvolvimento do Harness v0.
>
> Formato: Architecture Decision Record (ADR)
>
> Atualizado: 2026-07-12 00:00

---

## ADR-001: Component Responsibilities

**Decision:**
Cada componente tem uma responsabilidade única e bem definida. Componentes comunicam apenas através de contratos públicos (interfaces).

**Context:**
Harness é um motor de orquestração de papéis organizacionais. Necessita arquitetura modular pra suportar múltiplos papéis (Dev, QA, Product, etc.) sem crescimento uncontrolado de acoplamento.

Inicialmente, o sistema parecia requerer componentes que fizessem múltiplas coisas:
- ProjectLoader deveria entender AND interpretar o projeto
- ContextBuilder deveria coletar fatos AND estruturar AND validar

**Motivation:**
1. Isolamento: falha em um componente não cascateia
2. Testabilidade: cada componente testável em isolamento
3. Extensibilidade: novo papel não requer mudança em componentes existentes
4. Clareza: nome do componente descreve exatamente o que faz

**Consequences:**
- Componentes são menores, mais focados
- Contrato precisa ser bem definido (M2 é crítico)
- Mudança em responsabilidade requer mudança de contrato (raro)
- Validação arquitetural é mais clara (fácil debugar)

---

## ADR-002: Contratos Antes da Implementação

**Decision:**
Definir todas as interfaces públicas (contratos) antes de implementar qualquer componente. Validar type-check com contratos vazios.

**Context:**
Inicialmente havia tentação de implementar componentes incrementalmente, descobrindo o contrato no caminho. Isso levaria a refatorações em cascata quando um componente descobrisse que precisava de dados que outro não fornecia.

**Motivation:**
1. Força design upfront (não discovery durante implementação)
2. Identifica incompatibilidades arquiteturais cedo (M2, não M4)
3. Facilita implementação paralela de componentes
4. Contrato é contrato — mudá-lo é refatoração, não implementação

**Consequences:**
- M2 é investimento inicial em design (sem código executável)
- Contratos podem estar incompletos (evoluem em M4)
- Type-check passa sem fazer nada (por design)
- Clareza aumenta — implementadores sabem exatamente o que fazer

---

## ADR-003: Exception-Driven Error Handling

**Decision:**
Componentes lançam exceções em falhas. Componentes não retornam status de sucesso/erro no resultado (resultado é sucesso implícito).

**Context:**
Havia discussão sobre formato de retorno: ExecutionResult com status field, ou exceções?

Alternativas consideradas:
1. Result monad: `{ ok: boolean, value?, error? }`
2. Status field: `{ status: 'success' | 'error', data?, error? }`
3. Exceptions (escolhido)

**Motivation:**
1. Falha não é um resultado esperado — é uma interrupção
2. Código normal não precisa verificar status em cada linha
3. WorkflowEngine trata todas as exceções num lugar
4. Stack trace é fornecido automaticamente

**Consequences:**
- Componentes não tratam seu próprio erro (vaza pra cima)
- WorkflowEngine é responsável por capturar e reportar
- Testes precisam usar try/catch ou assertion helpers
- Mais simples que result monad, menos boilerplate

---

## ADR-004: ProjectLoader Coleta Fatos, Não Interpretação

**Decision:**
ProjectLoader extrai apenas fatos objetivos e baratos de obter (estrutura, tecnologias simples, scripts, arquivos). Não interpreta o projeto.

**Context:**
Há tentação de fazer ProjectLoader "inteligente": analisar código, construir grafo, executar heurísticas. Isso violaria separação de responsabilidades.

**Motivation:**
1. ProjectLoader fica simples e rápido
2. Interpretação é responsabilidade explícita de outro componente (ContextBuilder ou especializado)
3. Fatos são reutilizáveis; interpretação é context-dependent
4. Mudança em heurística não afeta coleta de fatos

**Consequences:**
- ProjectMetadata é genérico, não especializado
- Interpretação fica pra ContextBuilder
- ContextBuilder pode evoluir sem tocar em ProjectLoader
- Arquitetura é mais clara (coleta vs. interpretação separadas)

---

## ADR-005: Context é Genérico, Não Role-Específico

**Decision:**
Context é um modelo de dados universal. Cada Role consome apenas o subconjunto que precisa. Não há Context especializado por Role.

**Context:**
Havia discusão: deveria haver ContextForDev, ContextForQA? Ou um Context genérico?

**Motivation:**
1. Novo Role não requer novo tipo Context (YAGNI)
2. Context é o "contrato de dados" entre pipeline e Role
3. Role decide o que usar — não Context decide o que fornecer
4. Aumento de responsabilidade do Context é sinal de design ruim

**Consequences:**
- Context é "tudo que o pipeline coletou"
- Role ignora dados desnecessários
- Quando Context crescer, é sinais de que precisa refatoração
- Extensibilidade é simples: adicionar dados a Context não quebra Roles existentes

---

## ADR-006: RoleOutput Inclui Artifacts Opcionais

**Decision:**
RoleOutput retorna `{ role, executedAt, result, artifacts? }`. Artefatos de conhecimento são opcionais, extraídos do RoleOutput pelo WorkflowEngine.

**Context:**
Questão: quem é responsável por extrair KnowledgeArtifacts de uma execução?

Alternativas consideradas:
1. Componente extrator dedicado (prematuro, sem validação)
2. MemoryWriter tenta extrair (acoplado a detalhes da Role)
3. Role retorna artefatos quando identifica explicitamente (escolhido)

**Motivation:**
1. Dev Role sabe quando descobriu conhecimento reutilizável
2. Sem componente intermediário (YAGNI)
3. Outros Roles podem fazer igual
4. Quando múltiplos Roles repetirem, extrair em componente

**Consequences:**
- Dev Role tem pequena responsabilidade extra (listar artifacts)
- MemoryWriter é simples: só persiste o que recebe
- Sem abstração prematura de "extração de conhecimento"
- Se padrão se repetir, fácil de refatorar depois

---

## ADR-007: Validação Incremental com Milestones

**Decision:**
Implementação ocorre em milestones (M1, M2, M3, M4...). Cada milestone é completo, executável, testável. Entre milestones, revisão arquitetural.

**Context:**
Havia pressão pra implementar tudo de uma vez. Isso torna impossível isolar onde a arquitetura falha.

**Motivation:**
1. Cada milestone valida parte da arquitetura
2. Impossível terminar um milestone com a arquitetura quebrada
3. Se M4 falhar, sabe-se que foi M4 (não M3 ou M4)
4. Oportunidade de revisão antes de prosseguir

**Consequences:**
- Desenvolvimento é mais lento inicialmente (M1, M2, M3 são setup)
- Menos refatoração depois (problemas encontrados cedo)
- Maior confiança na arquitetura
- Documentação emerge naturalmente (cada milestone é documentado)

---

## ADR-008: Um Componente por Milestone em M4

**Decision:**
Em M4 (evolução), apenas um componente é implementado por etapa. Após cada componente, pipeline executa + revisão arquitetural.

**Context:**
Tentação: implementar vários componentes juntos pra "acelerar". Isso torna impossível isolar impacto.

**Motivation:**
1. Se pipeline quebra após implementar comp A e comp B, qual foi?
2. Isolamento permite compreensão de impacto de cada decisão
3. Revisão focal: "o que ProjectLoader real quebrou?"
4. Validação incremental pura

**Consequences:**
- M4 leva mais tempo
- Cada componente é validado isoladamente
- Quando todos estiverem prontos, sistema está pronto
- Melhor para aprender e documentar decisões

---

## ADR-009: Sem Abstração Prematura

**Decision:**
Abstrações são introduzidas apenas quando observados em 2+ componentes, nunca quando previsto.

**Context:**
Tendência natural: "vou criar um utilitário pra isso porque vai ser usado em múltiplos lugares". Resultado: utilitários que ninguém usa ou que obscurecem o código.

**Motivation:**
1. Você não sabe realmente o padrão até ver ele 2x
2. Primeira ocorrência pode ser um caso especial
3. Abstração prematura cria camadas desnecessárias
4. YAGNI: não implemente pra futuro que pode não vir

**Consequences:**
- Código é mais repetitivo inicialmente
- Menos camadas de indireção
- Quando abstração é necessária, está óbvia
- Refatoração pra abstração é simples e bem motivada

---

## ADR-010: Tipo-Driven Design

**Decision:**
TypeScript tipos são usados como ferramenta de design. Contratos são interfaces. Validação arquitetural ocorre através de type-check.

**Context:**
Alternativa: usar tipos apenas pra documentação, implementação é dinâmica. Resultado: erros em runtime que poderiam ser erros em compile-time.

**Motivation:**
1. Type-check detecta incompatibilidade de contrato antes de runtime
2. Refactoring é mais seguro (type-check valida)
3. Documentação é automática (tipos são código)
4. Menos testes necessários pra validar interfaces

**Consequences:**
- Investimento inicial em tipos (M2)
- Algumas soluções elegantes em runtime ficam complexas em tipos
- Menos bugs relacionados a contrato
- Maior confiança na arquitetura

---

## Notas de Evolução

Estas decisões valem para Harness v0 e foram validadas através de M1-M4. Futuras versões podem revisar conforme novos Roles e complexidade aumentem.

Mudanças arquiteturais importantes devem ser registradas como novos ADRs, não atualizações dos existentes.
