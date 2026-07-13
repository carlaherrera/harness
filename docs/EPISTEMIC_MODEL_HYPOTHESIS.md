# Hipótese do Modelo Epistêmico

> Atualizado: 2026-07-13 14:00
> Status: CHECKPOINT CONCEITUAL (Não validado na prática)

## 1. Hipótese Central

O Harness governa a rastreabilidade de alegações, justificativas e decisões produzidas por atores ao longo do tempo.

## 2. Definição Técnica Provisória

O Harness fornece uma infraestrutura para registrar, conectar e acompanhar o ciclo de vida de eventos epistêmicos sem determinar o valor de verdade de suas conclusões.

## 3. Responsabilidades Presumidas

* Registrar o que foi alegado.
* Preservar as alegações ou observações utilizadas como base.
* Registrar o ator responsável.
* Registrar a transformação, regra ou justificativa declarada.
* Preservar contexto e tempo.
* Permitir rastreabilidade e auditoria retrospectiva.
* Manter histórico de contestação, invalidação e obsolescência.

## 4. Limites Explícitos

O Harness **não**:
* descobre a verdade;
* garante conclusões corretas;
* executa necessariamente o raciocínio;
* garante explicabilidade;
* garante reprodutibilidade;
* valida semanticamente uma justificativa;
* impede decisões ruins ou insuficientemente fundamentadas.

## 5. Unidade Fundamental Candidata

**Candidato Primário:** `Evento Epistêmico` como unidade única.
* Estrutura: Ator + contexto + alegações de origem + transformação declarada + alegação resultante + tempo.

**Hipótese Alternativa:** O modelo pode exigir três entidades independentes:
1. Alegação
2. Evento
3. Relação de justificação

(A escolha entre as candidatas permanece em aberto para validação arquitetural futura).

## 6. Conclusões com Confiança Alta

* O modelo linear de informação é insuficiente.
* Alegações podem convergir, divergir, ser contestadas e tornar-se obsoletas.
* Proveniência é parte estrutural do domínio.
* Rastreabilidade não equivale a explicabilidade ou reprodutibilidade.
* O sistema deve governar alegações, não declarar verdades.

## 7. Hipóteses Ainda Abertas

* Granularidade adequada do registro.
* Evento Epistêmico como unidade única versus Alegação + Evento + Relação.
* Política de invalidação em cascata.
* Papel operacional da factualidade.
* Custo ergonômico e cognitivo do modelo.
* Quanto pode ser capturado automaticamente.
