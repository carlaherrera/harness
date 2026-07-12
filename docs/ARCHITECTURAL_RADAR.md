# Radar Arquitetural — Harness

> Índice das oportunidades arquiteturais descobertas por investigação epistemológica.
> NÃO é backlog. É referência. Revisitar quando as oportunidades surgirem organicamente na implementação.
>
> Ponto de entrada do projeto: `PROJECT_STATE.md`
>
> Atualizado: 2026-07-12 03:30

---

## O Que É

Durante um ciclo de descoberta conceitual, o pipeline do Harness foi analisado sob um modelo epistemológico (estados da informação + proveniência). O modelo sobreviveu a dois experimentos práticos contra output real (16 informações classificadas). Foi então usado como critério para avaliar os componentes.

Este radar aponta ONDE há inconsistências arquiteturais reais. NÃO diz COMO resolvê-las. Cada uma volta à mesa quando a implementação natural a encontrar.

---

## Modelo de Referência (não é arquitetura, é critério)

Cadeia de estados da informação:

```
Realidade → Observação → Evidência → Inferência → Interpretação → Conhecimento
                                    ↑
                              (+ Decisão: afirmação por política sem lastro observacional)
```

Seis estados. Cada informação deveria carregar seu **estatuto** (que estado é) e sua **proveniência** (de que depende).

Palavra "fato" = dispensável e prejudicial (achata estados, infla certeza).

---

## Oportunidades (priorizadas por impacto)

| # | Oportunidade | Componente | Impacto | Eixo |
|---|-------------|-----------|---------|------|
| 1 | Decisão disfarçada de observação (`npm` default) | ProjectLoader | MÁXIMO | A |
| 2 | Ausência-de-obs colapsada com obs-de-ausência (`[]`,`{}`) | ProjectLoader | ALTO | B |
| 3 | Interpretação na fase "coleta" (relevância) | ProjectLoader | ALTO | A |
| 4 | Inflação Interpretação→Conhecimento (KnowledgeArtifact) | RoleOutput/MemoryWriter | MÉDIO-ALTO | A |
| 5 | Norma de valor sem proveniência (constraints) | DevRole | MÉDIO | A |
| 6 | Confiança não é atributo 1ª classe | transversal | BAIXO-MÉDIO | B |
| 7 | Proveniência não preservada | transversal | FUNDACIONAL/DIFUSO | B |

**Eixo A** = inflação de estatuto epistêmico (afirmar mais certeza que se tem).
**Eixo B** = perda de distinção/proveniência (valores nus sem metadado).

**Concentração:** ProjectLoader detém 3 das 4 maiores (#1,#2,#3) — a fronteira onde o mundo heterogêneo encontra observador Node.js-cêntrico.

---

## Documentos do Radar (linhagem completa)

Ordem cronológica da descoberta:

1. `EXPERIMENTS.md` — matriz de 4 projetos reais (Node/PHP/WordPress/Next.js)
2. `MODEL_ANALYSIS.md` — análise do modelo ProjectMetadata
3. `PROJECTMETADATA_CONSUMPTION.md` — o que ContextBuilder consome
4. `CONTEXT_BUILDER_STRATEGY.md` — 3 opções de estratégia
5. `HYPOTHESIS_UNIVERSAL_CONTEXT.md` — hipótese ContextBuilder agnóstico
6. `EXPERIMENT_MINIMAL_CONTEXT.md` — validação: interpretação pertence ao Role
7. `CONTEXT_CONSUMPTION_ANALYSIS.md` — consumo real de Context
8. `ARCHITECTURAL_DECISION_CONTEXT_RESPONSIBILITY.md` — **ADR aceito** (única decisão firme)
9. `CONTEXT_UNIVERSAL_DISCOVERY.md` — consumo cruzado entre Roles simulados
10. `INFORMATION_FLOW_AND_OWNERSHIP.md` — mapa de origem/responsabilidade
11. `CONCEPTUAL_REVIEW.md` — crítica conceitual, 5 hipóteses ocultas
12. `EPISTEMOLOGY_OF_INFORMATION.md` — o que é um fato
13. `STATES_OF_INFORMATION.md` — cadeia de 6 estados, proveniência
14. `EXPERIMENT_MODEL_VS_REALITY.md` — modelo vs. ProjectLoader real (forçou 6º estado)
15. `EXPERIMENT_MODEL_VS_REALITY_DOWNSTREAM.md` — modelo vs. pipeline downstream
16. `ARCHITECTURAL_OPPORTUNITIES.md` — as 7 oportunidades priorizadas

---

## Decisões Firmes (o que saiu deste ciclo como estável)

Apenas UMA decisão arquitetural foi aceita:
- **ADR-CONTEXT-RESPONSIBILITY**: ContextBuilder organiza, Roles interpretam.

Todo o resto = **hipótese validável**, não decisão. O modelo epistemológico é referência, não arquitetura.

---

## Como Usar Este Radar

- Ao mexer no ProjectLoader → checar #1, #2, #3.
- Ao mexer em artifacts/memory → checar #4.
- Ao mexer em constraints → checar #5.
- Quando surgir necessidade real de priorizar por confiança → #6.
- Quando duas oportunidades acima exigirem rastrear origem → #7 deixa de ser prematuro.

Não atacar preventivamente. YAGNI (ADR-009). Deixar emergir.

---

**Status:** REFERÊNCIA (não backlog)
**Ciclo conceitual:** ENCERRADO
**Modo atual:** desenvolvimento normal
