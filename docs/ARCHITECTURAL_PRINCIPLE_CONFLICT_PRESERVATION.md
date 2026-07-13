# Princípio Arquitetural: Preservação de Conflito

## Nome do Princípio
Conflict Preservation over Invalid Resolution (Preservação de Conflito sobre Resolução Inválida)

## Problema
Sistemas de orquestração lidam com múltiplas fontes de restrições (políticas, contexto, papéis). Conflitos emergem naturalmente. Quando um mecanismo de resolução (ex: arquivo de configuração) fornece uma decisão inválida, ambígua, corrompida, ou quando não existe decisão configurada para o conflito, o sistema precisa decidir entre forçar um fallback ou abortar a resolução.

## Decisão
Um resolvedor deve falhar de forma segura, preservando o conflito original intacto. Ele não deve forçar resoluções padrão, "engolir" erros de tipagem, ou aplicar fallbacks não-determinísticos. A tentativa de resolução possui três estados estritos:
1. Resolução válida aplicada (política exata bate com o alvo).
2. Regra inválida rejeitada (falha de configuração, ex: tipo errado).
3. Regra ausente explicitada (ausência de decisão organizacional).

Tanto a regra inválida quanto a regra ausente preservam o conflito original intacto, mas são eventos distintos. A falha em resolver deve ser uma informação explícita e rastreável, nunca um silêncio operacional.

## Justificativa
Um conflito explícito é visível, rastreável e força intervenção (humana ou do pipeline). Uma resolução inválida forçada ou "mascarada" por fallback cria inconsistência silenciosa, propagando restrições corrompidas para papéis downstream. 

Falha de configuração (regra inválida) exige correção técnica. Ausência de decisão (regra ausente) exige escalonamento organizacional. Preservar o conflito e distinguir os motivos mantém a integridade epistêmica do sistema: é melhor não saber o que fazer — e explicitar que não sabe — do que fazer a coisa errada com convicção.

## Consequências
- Conflitos voltam a ser visíveis no pipeline (halt de execução downstream).
- Mecanismos de resolução (como o `ResolverRole`) atuam como validadores estritos, não como inferidores de intenção.
- Operadores do sistema recebem sinais claros (logs + artefatos) de que a resolução falhou, distinguindo entre configuração quebrada e política inexistente.
- A expressão prática desse princípio requer artefatos de estado explícitos (na implementação atual, via artefato `unresolved-conflict`), tornando o "não fazer" uma ação observável.
