# Architecture Method

> Método de trabalho para design, validação e evolução de arquiteturas de software.
>
> Atualizado: 2026-07-12 00:00

## Princípios Arquiteturais

### 1. Responsabilidade Única e Clara
Cada componente tem exatamente uma responsabilidade bem definida. Componentes comunicam através de contratos públicos (interfaces). Alterações internas de um componente não afetam consumidores.

### 2. Design-by-Contract
Contratos (interfaces) defem o "quê" antes de qualquer implementação. Implementações preenchem o "como". Contratos são validados através de type-checking.

### 3. Validação Incremental
Arquitetura é validada através de execução end-to-end, não apenas testes. Cada milestone produz um artefato testável (execução completa do pipeline).

### 4. Sem Abstração Prematura
Abstrações são introduzidas apenas quando:
- Dois ou mais componentes implementam lógica idêntica
- A repetição já foi observada (não prevista)
- A abstração reduz clareza, não aumenta

### 5. Agnóstico de Implementação
Componentes não conhecem a implementação uns dos outros. Acoplamento é apenas no contrato. Implementações podem mudar, migrar, ser substituídas sem impacto.

### 6. Fatos antes de Interpretação
Componentes coletam e estruturam fatos. Interpretação é responsabilidade explícita de um componente especializado, não de múltiplos lugares.

---

## Fluxo de Descoberta

### Fase 1: Entendimento
**Objetivo:** Validar que o problema está bem definido antes de arquitetar.

**Ações:**
1. Explorar contexto atual (projeto, estado, restrições)
2. Fazer perguntas focadas (uma por vez, não genéricas)
3. Validar compreensão do caso de uso concreto
4. Identificar se o escopo é único ou múltiplos subsistemas independentes

**Saída:** Visão clara do problema, sem ambiguidade.

### Fase 2: Exploração de Abordagens
**Objetivo:** Avaliar 2-3 abordagens diferentes antes de decidir.

**Ações:**
1. Propor abordagens alternativas com trade-offs explícitos
2. Apresentar recomendação com justificativa
3. Levantar cenários de risco de cada abordagem
4. Validar alinhamento com restrições do projeto

**Saída:** Abordagem escolhida, com compreensão de alternativas rejeitadas.

### Fase 3: Definição de Contrato
**Objetivo:** Estabelecer interfaces que validem a arquitetura.

**Ações:**
1. Mapear componentes e suas responsabilidades
2. Definir contrato público de cada componente (interfaces, tipos, assinaturas)
3. Documentar fluxo de dados entre componentes
4. Validar type-check com contratos apenas (sem implementação)

**Saída:** Contratos tipados, sem código de negócio.

---

## Processo de Implementação Incremental

### Milestone Pattern

Cada milestone:
- Tem um objetivo claro e testável
- Produz um artefato executável (não apenas código)
- Encerra com critério de sucesso bem definido
- É seguido por revisão arquitetural antes do próximo

### Exemplo de Milestones

**M1: Bootstrap**
- Objetivo: Ambiente pronto para desenvolvimento
- Saída: Build + type-check funcionando
- Critério: Sem erros de compilação

**M2: Contratos**
- Objetivo: Definir interfaces de todos os componentes
- Saída: Arquivos de contrato, sem implementação
- Critério: Type-check limpo, sem lógica de negócio

**M3: Stubs + Pipeline**
- Objetivo: Validar fluxo completo end-to-end
- Saída: Componentes retornam dados mínimos, pipeline executa
- Critério: Execução completa sem erros, sem lógica real

**M4: Evolução por Componente**
- Objetivo: Implementar componentes reais um de cada vez
- Saída: Cada componente implementado, pipeline continua funcionando
- Critério: Após cada componente, pipeline roda + revisão antes do próximo

### Regra de Ouro: Um Componente por Etapa

Jamais implementar dois componentes no mesmo milestone. Razão: incapacidade de isolar impacto arquitetural.

Se componente A quebra, precisa-se saber que foi A que quebrou, não A ou B.

---

## Critérios para Introduzir Abstrações

### Não Abstrair Quando
- Apenas um componente faz algo
- Você está prevendo necessidade futura (YAGNI)
- A abstração obscurece o código original
- O padrão ainda não foi validado em produção

### Abstrair Quando
- Dois ou mais componentes já implementam lógica idêntica
- Remover a abstração pioraria a legibilidade
- A abstração tem contrato claro (não é um "utilitário")
- Será usada em 3+ lugares (regra do 3)

### Processo de Abstração
1. Documentar a repetição observada (não esperada)
2. Extrair interface (contrato) da abstração
3. Implementar a abstração com contrato
4. Refatorar consumidores pra usar a abstração
5. Executar pipeline completo
6. Revisar antes de prosseguir

---

## Regras para Evolução da Arquitetura

### Bifurcações Arquiteturais
Quando a arquitetura precisar de decisão importante:

1. **Pausar Implementação** — Não prosseguir até resolver
2. **Fazer Revisão Crítica** — Examinar contratos e implementações existentes
3. **Documentar a Decisão** — Registrar em ARCHITECTURE_DECISIONS.md
4. **Validar com Prototype** — Se incerto, implementar versão mínima pra testar
5. **Comunicar Impacto** — Quais componentes são afetados?

### Mudanças em Contratos
Contratos (interfaces) raramente mudam após M2. Quando mudam:

1. Indicam problema de design em M2
2. Afetam múltiplos consumidores
3. Requerem revisão antes de implementação

**Regra:** Se você está mudando contrato frequentemente, a responsabilidade do componente ainda não está clara.

### Refatoração Dentro de Componente
Mudanças internas (implementação privada) não requerem revisão se:
- Contrato permanece idêntico
- Comportamento não muda
- Pipeline continua funcionando

---

## Checklist para Revisão Arquitetural

Use este checklist quando revisar a arquitetura (geralmente após cada milestone):

### Responsabilidade
- [ ] Cada componente tem uma responsabilidade única?
- [ ] Nenhum componente faz duas coisas muito diferentes?
- [ ] A responsabilidade é clara pelo nome do componente?

### Contrato
- [ ] Cada componente tem contrato público (interface)?
- [ ] O contrato define completamente o que o componente faz?
- [ ] Consumidores só usam o contrato, não implementação?

### Fluxo de Dados
- [ ] Dados fluem claramente entre componentes?
- [ ] Nenhum componente lê estado global?
- [ ] A cadeia de chamadas é compreendida end-to-end?

### Acoplamento
- [ ] Componentes não conhecem implementação uns dos outros?
- [ ] Alteração em um componente quebra outro?
- [ ] Existe dependência cíclica?

### Tratamento de Erros
- [ ] Falhas são exceções ou status no resultado?
- [ ] Quem captura exceções?
- [ ] Erro em um componente afeta o pipeline?

### Extensibilidade
- [ ] Adicionar novo componente requer mudança em existentes?
- [ ] Novo papel (Role) requer nova abstração?
- [ ] Há "pontos de extensão" bem definidos?

---

## Definição de Pronto para Cada Milestone

### M1: Bootstrap
**Pronto quando:**
- Dependências instaladas sem erro
- Build compila sem warning/error
- Type-check passa
- Estrutura de pastas criada

**Validação:** `pnpm build && pnpm type-check`

### M2: Contratos
**Pronto quando:**
- Todas as interfaces definidas
- Sem implementação (métodos vazios ou stubs)
- Type-check passa
- Cada contrato documentado

**Validação:** `pnpm type-check`

### M3: Stubs + Pipeline
**Pronto quando:**
- Cada componente retorna dados mínimos
- Pipeline executa end-to-end sem erro
- Nenhuma lógica de negócio
- Nenhuma I/O real

**Validação:** Pipeline executa; revisar output pra confirmar stubs

### M4: Componente Real
**Pronto quando:**
- Um componente implementado completamente
- Testes passam (se existem)
- Pipeline continua funcionando
- Revisão arquitetural realizada

**Validação:** Pipeline executa; componente faz o que promete

---

## Como Usar Este Método em Novo Projeto

1. **Leia:** Fluxo de Descoberta (Fases 1-3)
2. **Aplique:** Brainstorm + Contratos antes de implementar
3. **Valide:** Use Milestone Pattern para implementação
4. **Revise:** Checklist para Revisão Arquitetural após cada etapa
5. **Documente:** ARCHITECTURE_DECISIONS.md para decisões importantes

---

## Anti-Padrões

### ❌ Implementar Tudo de Primeira
Resultado: Impossível saber onde a arquitetura falha.

### ❌ Abstrair Antes de Validar
Resultado: Abstrações que não servem a ninguém.

### ❌ Mudar Contrato Frequentemente
Resultado: Componentes acoplados, refatoração em cascata.

### ❌ Implementar Dois Componentes Juntos
Resultado: Impossível isolar impacto de cada um.

### ❌ Ignorar Revisão Arquitetural
Resultado: Decisões ruins solidificadas no código.

---

## Referências

- Design by Contract (Bertrand Meyer)
- SOLID Principles (Robert C. Martin)
- Architecture Decision Records (Michael Nygard)
- Test-Driven Development (Kent Beck)
