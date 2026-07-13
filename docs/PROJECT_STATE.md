# Estado do Projeto — Harness

> Documento-âncora. Ponto de entrada para retomar o projeto após semanas.
> Consolida o que foi produzido, classifica cada achado por estatuto, aponta onde continuar.
>
> Atualizado: 2026-07-12 03:30
> Ciclo encerrado: Descoberta Conceitual → Radar Arquitetural

---

## Leia Isto Primeiro (retomada em 30 segundos)

**NOVA DEFINIÇÃO DO SISTEMA:** O Harness é agora um sistema que transforma múltiplas fontes de contexto (regras, artifacts de outras roles, decisões) em uma **verdade unificada**, valida essa verdade (fail-fast em conflitos), e executa comportamentos de forma determinística e governada. 


O Harness v0 funciona: pipeline end-to-end (ProjectLoader → ContextBuilder → RoleRunner/DevRole → MemoryWriter), validado em 4 projetos reais.

O último ciclo NÃO implementou features. Foi **investigação conceitual**: descobrimos que o pipeline mistura estados epistêmicos da informação (observação, inferência, interpretação, decisão) sob a palavra única "fato", e que isso causa erros reais fora do ecossistema Node.js.

O resultado virou **Radar Arquitetural** — referência, não backlog. Nada será implementado preventivamente.

**Uma única decisão arquitetural saiu firme:** ContextBuilder organiza fatos, Roles interpretam.

Pipeline de código permanece **inalterado**. Tudo que se produziu foi documentação e código experimental não-integrado.

---

## Classificação de Tudo o Que Foi Produzido

### Princípios Arquiteturais (firmes — guiam implementação)

| Princípio | Fonte | Status |
|-----------|-------|--------|
| ContextBuilder organiza, Roles interpretam | ADR-CONTEXT-RESPONSIBILITY | **FIRME** — validado experimentalmente |
| Componentes produzem fatos; Roles produzem significado | ADR-004 + revisão | FIRME com ressalva (ver Hipóteses) |
| Sem abstração prematura (YAGNI) | ADR-009 | FIRME |
| Contratos antes de implementação | ADR-002 | FIRME |
| Validação incremental por milestone | ADR-007 | FIRME |

### Validado (evidência prática produzida)

| Achado | Evidência |
|--------|-----------|
| Pipeline funciona end-to-end | 4 projetos reais executados |
| ProjectLoader é Node.js-cêntrico | Node ✓, PHP ✗, WordPress ⚠️, Next ✓ (EXPERIMENTS.md) |
| Interpretação pode migrar ContextBuilder→Role sem perda | 100% equivalência em 4 projetos (EXPERIMENT_MINIMAL_CONTEXT.md) |
| Modelo epistemológico descreve output real do Harness | 16 informações classificadas, 2 experimentos (EXPERIMENT_MODEL_VS_REALITY*.md) |
| Apenas 3 campos de Context são universais entre Roles | objective, name, technologies (CONTEXT_UNIVERSAL_DISCOVERY.md) |

### Hipótese (validável, NÃO decisão)

| Hipótese | Onde |
|----------|------|
| "Existe fato independente de intenção" é falso; há observação (objetiva) + fato-contextualizado | EPISTEMOLOGY_OF_INFORMATION.md |
| Cadeia de 6 estados (Obs→Evid→Infer→Interp→Conhec + Decisão) é o modelo correto da informação | STATES_OF_INFORMATION.md |
| Proveniência (linhagem) é constitutiva do conhecimento | STATES_OF_INFORMATION.md |
| Palavra "fato" é dispensável e prejudicial | EPISTEMOLOGY + STATES |
| Conhecimento organizacional exige linhagem preservada | STATES_OF_INFORMATION.md |
| 5 hipóteses ocultas do modelo atual (intenção como luz, unidirecionalidade, natureza singular, etc.) | CONCEPTUAL_REVIEW.md |

**Regra:** nenhuma dessas vira princípio antes de sobreviver a experimento prático adicional.

### Radar Arquitetural (oportunidades — revisitar quando surgir organicamente)

7 oportunidades priorizadas. Índice completo em `ARCHITECTURAL_RADAR.md`. Resumo:

| # | Oportunidade | Componente | Impacto |
|---|-------------|-----------|---------|
| 1 | Decisão disfarçada de observação (`npm` default) | ProjectLoader | MÁXIMO |
| 2 | Ausência-de-obs colapsada (`[]`,`{}`) | ProjectLoader | ALTO |
| 3 | Interpretação na fase "coleta" (relevância) | ProjectLoader | ALTO |
| 4 | Inflação Interpretação→Conhecimento | RoleOutput/MemoryWriter | MÉDIO-ALTO |
| 5 | Norma de valor sem proveniência (constraints) | DevRole | MÉDIO |
| 6 | Confiança não é 1ª classe | transversal | BAIXO-MÉDIO |
| 7 | Proveniência não preservada | transversal | FUNDACIONAL/DIFUSO |

---

## Mapa da Documentação

Cada documento tem um estatuto:
- **VIVO** — reflete o estado atual; atualizar conforme o projeto evolui.
- **REFERÊNCIA** — estável; consultado, raramente alterado.
- **HISTÓRICO** — registro de como se chegou a um achado; NÃO atualizar (é proveniência congelada). Deletar destruiria a linhagem auditável.

### VIVO (estado do projeto — manter atualizado)
| Documento | Propósito único | Estatuto |
|-----------|-----------------|----------|
| `PROJECT_STATE.md` | Âncora de retomada — ponto de entrada único | **VIVO** |
| `HARNESS_V0_REVIEW.md` | Review do v0: o que existe, limites, próximos experimentos | **VIVO** |
| `ARCHITECTURAL_RADAR.md` | Índice das 7 oportunidades — bússola de implementação | **VIVO** |

### REFERÊNCIA (estável — consultar)
| Documento | Propósito único | Estatuto |
|-----------|-----------------|----------|
| `ARCHITECTURE_METHOD.md` | Método reutilizável de design (Hipótese→Experimento→...) | **REFERÊNCIA** |
| `ARCHITECTURE_DECISIONS.md` | 10 ADRs do design original do v0 | **REFERÊNCIA** |
| `ARCHITECTURAL_DECISION_CONTEXT_RESPONSIBILITY.md` | ADR firme: ContextBuilder organiza, Roles interpretam | **REFERÊNCIA** |
| `ARCHITECTURAL_OPPORTUNITIES.md` | As 7 oportunidades com evidência e critério (detalhe do Radar) | **REFERÊNCIA** |
| `STATES_OF_INFORMATION.md` | Modelo dos 6 estados + proveniência (critério epistêmico) | **REFERÊNCIA** |
| `EPISTEMOLOGY_OF_INFORMATION.md` | Definições epistêmicas; por que "fato" é prejudicial | **REFERÊNCIA** |

### HISTÓRICO (linhagem/proveniência — NÃO atualizar, NÃO deletar)
Documentam COMO se chegou aos achados. São a prova auditável. Congelados por design (coerente com o princípio de proveniência que o próprio ciclo validou):
| Documento | Propósito único | Estatuto |
|-----------|-----------------|----------|
| `EXPERIMENTS.md` | Matriz de 4 projetos reais (Node/PHP/WordPress/Next) | **HISTÓRICO** |
| `MODEL_ANALYSIS.md` | Primeira análise do modelo ProjectMetadata | **HISTÓRICO** |
| `PROJECTMETADATA_CONSUMPTION.md` | O que ContextBuilder consome de ProjectMetadata | **HISTÓRICO** |
| `CONTEXT_BUILDER_STRATEGY.md` | 3 opções de estratégia (descartadas por uma 4ª) | **HISTÓRICO** |
| `HYPOTHESIS_UNIVERSAL_CONTEXT.md` | Hipótese ContextBuilder agnóstico (depois validada) | **HISTÓRICO** |
| `EXPERIMENT_MINIMAL_CONTEXT.md` | Validação: interpretação migra Role sem perda | **HISTÓRICO** |
| `CONTEXT_CONSUMPTION_ANALYSIS.md` | Consumo real de Context pelo DevRole | **HISTÓRICO** |
| `CONTEXT_UNIVERSAL_DISCOVERY.md` | Consumo cruzado entre Roles simulados | **HISTÓRICO** |
| `INFORMATION_FLOW_AND_OWNERSHIP.md` | Mapa de origem/responsabilidade da informação | **HISTÓRICO** |
| `CONCEPTUAL_REVIEW.md` | Crítica conceitual; 5 hipóteses ocultas | **HISTÓRICO** |
| `EXPERIMENT_MODEL_VS_REALITY.md` | Modelo vs. ProjectLoader real (forçou 6º estado) | **HISTÓRICO** |
| `EXPERIMENT_MODEL_VS_REALITY_DOWNSTREAM.md` | Modelo vs. pipeline downstream | **HISTÓRICO** |

### Código experimental (não integrado — referência dos experimentos)
- `src/core/context-builder/context-builder-minimal.ts`
- `src/roles/dev/dev-experimental.ts`
- `src/roles/{architect,reviewer,documentation}/*-simulated.ts`
- `project-loader.ts` tem `logger.debug` de metadata (instrumentação — não afeta comportamento)

Pipeline REAL não usa nenhum deles. Permanecem para reproduzir experimentos.

---

## Próximo Ciclo (apenas objetivos — sem soluções)

O objetivo do projeto muda oficialmente: de descoberta conceitual para **evolução arquitetural baseada em evidências**.

Objetivos do próximo ciclo (a escolher quando retomar):

1. **Retomar desenvolvimento normal.** Implementar o que o Harness precisa naturalmente (novos Roles reais, novos objetivos), deixando as oportunidades do Radar emergirem da prática.
2. **Observar se as oportunidades do Radar reaparecem.** Especialmente as 3 do ProjectLoader (#1,#2,#3) — surgirão no primeiro projeto não-Node que precisar funcionar de verdade.
3. **Não atacar o Radar preventivamente.** Cada oportunidade só vira trabalho quando a implementação a encontrar (YAGNI/ADR-009).

Sem soluções aqui. Sem implementação. Apenas direção.

---

## Ponto de Retomada (por onde continuar)

Quando voltar ao projeto:

1. **Leia este documento** (PROJECT_STATE.md) — restaura contexto completo.
2. **Verifique a revisão agendada do Radar** (CRM, 14 dias) — se já passou, é o primeiro trabalho.
3. **Decida o próximo trabalho de implementação real.** O Harness v0 está pronto para receber:
   - um novo Role real (além de Dev), OU
   - um teste sério em projeto não-Node (que ativará Radar #1,#2,#3), OU
   - o fechamento do ciclo de conhecimento (Radar #4 — fazer algo RELER os artifacts persistidos).
4. **Regra de ouro mantida:** Hipótese → Experimento → Observação → Comparação → Decisão. Nunca decidir arquitetura por opinião.
5. **O Radar é bússola, não mapa.** Consulta quando tocar o componente relevante; não dirige a implementação.

### Estado técnico exato

- Pipeline: **funcional, inalterado**. `pnpm build` limpo, `node dist/cli.js dev <path> -o "<obj>"` executa.
- Git: **projeto sem git ativo** (decisão da Carla). Docs são a memória durável.
- Última execução verde: hubdev-pro (Next.js), 3 artifacts persistidos.

---

**Status:** CICLO ENCERRADO OFICIALMENTE
**Modo:** desenvolvimento normal (aguardando próxima sessão)
**Decisões firmes deste ciclo:** 1 (ADR-CONTEXT-RESPONSIBILITY)
**Radar:** 7 oportunidades em referência
**Revisão do Radar:** agendada CRM +14 dias
