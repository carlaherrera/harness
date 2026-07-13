> Atualizado: 2026-07-13 19:09

# Estado validado

Pipeline de governança de conflitos:

Observação → Inferência → Decisão → Detecção dinâmica de conflitos → Resolução externa → Validação da resolução → Execução ou bloqueio

`DevRole` normaliza constraints vindas de múltiplas fontes (`context.constraints`, artifacts de decisão do Architect, formato `rules`), deriva constraints implícitas (ex: `require logger` → `forbid console.log`), deduplica por `type:target` priorizando maior prioridade, detecta conflito `forbid` vs `allow` por target, e aplica resoluções externas (`resolutions[]`) substituindo as constraints conflitantes pela decisão resolvida (prioridade 999).

`ResolverRole` lê `resolution-rules.json` externo, casa por `target`, valida a decisão (`forbid`/`allow`/`require`), e produz `resolutions[]` ou artifact `unresolved-conflict` quando não há regra.

# Propriedades comprovadas

- ✓ Policy válida resolve conflito
- ✓ Policy inválida é rejeitada
- ✓ Ausência de regra gera `unresolved-conflict`
- ✓ Resolver nunca inventa fallback
- ✓ Múltiplas resoluções coexistem
- ✓ Resolução parcial funciona
- ✓ Dev aplica resolução por target
- ✓ Targets são derivados dinamicamente das constraints
- ✓ Novos targets funcionam sem alterar o núcleo
- ✓ Fail-fast permanece

# Contratos atuais

- `resolutions` é uma coleção (`Array<{target, decision}>`)
- Cada resolução possui `target` + `decision`
- Ausência de resolução é representada por collection vazia + artifact `unresolved-conflict`
- `additionalContext` continua sendo JSON implícito (`JSON.parse` sem schema)
- Não existe contrato formal compartilhado entre Roles

# Limitações atuais

- `parsedContext` não possui tipagem formal
- Payload entre roles continua implícito
- Dev considera conflito apenas como `forbid` vs `allow`
- Fail-fast interrompe no primeiro conflito
- Não existe suíte permanente de testes

# Relação com a visão do produto

O núcleo deixou de depender de targets específicos de engenharia. Novas capacidades organizacionais podem introduzir seus próprios targets, constraints e regras sem modificar a lógica central de detecção de conflitos.

# Próxima pergunta arquitetural

O que constitui uma Capability instalável no Harness e qual é o contrato mínimo necessário para que um novo time opere sem modificar o núcleo?
