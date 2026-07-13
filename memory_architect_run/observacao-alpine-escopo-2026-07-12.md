# Observação: Escopo no Alpine.js

**Contexto:** Debug de erro "viewMode is not defined" em interface PHP.
**Impacto:** Médio
**Tipo:** observacao-de-uso

## Descrição
Durante debug de UI, o erro "viewMode is not defined" ocorreu porque os botões que utilizavam a variável estavam fora do escopo do elemento que declarava o estado Alpine (`x-data="tarefasGlobais()"`).

## Aprendizado
No Alpine.js, o estado é estritamente vinculado à hierarquia do DOM (diferente de estado global em SPA). 
Problemas de variáveis "não definidas" na UI frequentemente não são erros de declaração ou sintaxe, mas de **escopo estrutural**. O componente que consome o estado não é "filho" (na árvore DOM) do componente que o provê.

Entender a fronteira do componente no DOM é o primeiro passo para debug efetivo no Alpine.js.