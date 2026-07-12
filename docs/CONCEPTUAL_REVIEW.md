# Revisão Conceitual Independente — Harness v0

> Crítica arquitetural baseada apenas em evidências produzidas.
> Sem propostas de solução. Sem implementação.
> Descreve o Harness em termos de transformação de informação.
>
> Data: 2026-07-12
> Papel: Arquiteto independente

---

## Preâmbulo: O Harness Descrito Sem Nomes de Classe

Ignorando ProjectLoader, ContextBuilder, RoleRunner, etc., o Harness é:

> Uma função que recebe **(um lugar, uma intenção)** e produz **conhecimento persistente**.

```
(lugar, intenção) → conhecimento
```

Entre a entrada e a saída, a informação passa por transformações sucessivas.

Descrevendo apenas as transformações:

```
lugar físico
  ↓ [observação]
fatos brutos sobre o lugar
  ↓ [seleção + leitura]
fatos + conteúdo relevante
  ↓ [interpretação sob uma intenção]
significado (juízos, padrões, lacunas)
  ↓ [destilação]
conhecimento reutilizável
  ↓ [inscrição]
conhecimento persistente
```

Cinco transformações. Guardem este esqueleto — a crítica toda gira em torno dele.

---

## Pergunta 1: Estamos modelando o problema ou presos à implementação?

**Resposta: Ainda presos à implementação, mas rompendo.**

### Evidência de que estávamos presos

Os primeiros documentos (EXPERIMENTS, MODEL_ANALYSIS) perguntavam:
- "ProjectLoader detecta PHP?"
- "packageManager suporta composer?"

Essas são perguntas de **implementação de um componente nomeado**, não do problema.

O problema real nunca foi "detectar PHP". Foi: **como observar um lugar sem assumir sua natureza**.

### Evidência da ruptura

O documento INFORMATION_FLOW mudou a pergunta de "quem consome?" para "quem é proprietário?".

Isso é um movimento de implementação → modelo. Proprietário é um conceito, não uma classe.

Mas a ruptura é **incompleta**. O mapa de ownership ainda está organizado por **campos de estruturas de dados existentes** (`project.path`, `context.constraints`). Ainda pensamos em termos de "os campos que já existem", não "as informações que existem no domínio".

### O sintoma revelador

Toda a discussão sobre "Context inchado", "campos redundantes", "technologies alias" — é **crítica de estrutura de dados**, não de modelo conceitual.

Um modelo conceitual não teria `technologies` e `technologies alias` para começar. Que esses dois existam e discutamos qual remover é prova de que estamos depurando uma implementação, não desenhando um modelo.

---

## Pergunta 2: Existe conceito mais fundamental não percebido?

**Sim. Três.**

### Conceito não percebido nº 1: A intenção deveria estar presente desde a observação

Hoje o pipeline coleta fatos PRIMEIRO, recebe a intenção (objetivo) e só a usa no fim (no Role).

Mas observe a evidência dos experimentos:

- Em PHP, coletamos "não há scripts npm" como se fosse um fato neutro.
- O Role então julgou isso como "constraint: sem testes".

O problema: **a observação foi cega à intenção**. Coletamos "ausência de X" onde X só importa para um tipo de projeto.

Um modelo mais fundamental: **a intenção condiciona o que vale a pena observar**. Um médico e um pintor entram na mesma sala e observam coisas diferentes. Hoje o Harness observa como se não tivesse propósito, depois cobra propósito do Role.

Isto não está nos ADRs. ADR-004 diz "ProjectLoader coleta fatos, não interpretação" — assume que existe um conjunto de fatos **objetivo e independente de propósito**. A evidência PHP sugere que esse conjunto não existe. "Ausência de test script" só é um fato coletável porque alguém já decidiu que testes importam.

### Conceito não percebido nº 2: Fato e interpretação não são dois estágios — são um espectro

O modelo atual assume uma fronteira nítida:
- Componentes = fatos
- Roles = significado

Mas a evidência mostra gradações:

| Informação | É fato? | É interpretação? |
|------------|---------|------------------|
| "existe arquivo package.json" | fato puro | — |
| "tecnologia: TypeScript" | fato... | ...mas inferido de deps |
| "packageManager: npm" | fato... | ...mas escolhido por prioridade de lock files |
| "mainFramework: Next.js" | quase fato | mapeamento já é juízo |
| "constraint: sem testes" | — | interpretação pura |

Há um **gradiente de inferência**, não uma parede. `packageManager: 'npm'` (default quando não encontra) é um caso onde a "coleta de fato" já embute um juízo ("na dúvida, assuma npm").

O modelo binário fato-vs-interpretação é uma simplificação que a própria evidência refuta. `mainFramework` é o caso limítrofe que ninguém consome — talvez porque ninguém sabe se é fato ou interpretação.

### Conceito não percebido nº 3: "Relevância" é uma interpretação disfarçada de coleta

O conjunto `RelevantFiles` tem "relevant" no nome. Relevância **para quê**? Para uma intenção.

A observação seleciona `package.json`, `tsconfig.json`, `CLAUDE.md`, `README.md` como "relevantes" — e ignora `composer.json`. Isto é apresentado como coleta de fato, mas "o que é relevante" é já um juízo, e um juízo Node.js-cêntrico.

Ou seja: a interpretação **já vazou para dentro da fase de observação**, escondida na palavra "relevante". O sistema afirma separar observação de interpretação, mas a separação é violada no primeiro estágio, silenciosamente.

---

## Pergunta 3: Pipeline de componentes ou de transformação de informação?

**Hoje: modelado como pipeline de componentes. Deveria ser: pipeline de transformação de informação.**

### A diferença não é cosmética

Um **pipeline de componentes** pergunta: "o que cada caixa faz?" Leva a discussões sobre responsabilidade de caixas ("ContextBuilder deveria interpretar?").

Um **pipeline de transformação de informação** pergunta: "que transformações a informação sofre, e onde cada uma legitimamente ocorre?" As caixas são consequência, não premissa.

### Evidência de que estamos presos a componentes

Todo o debate recente é sobre **fronteiras de caixas**:
- "constraints deveria nascer no ContextBuilder ou no DevRole?"
- "Context está inchado?"

Se pensássemos em transformações, a pergunta seria outra:
- "A transformação **interpretação** está ocorrendo em dois lugares?" (Sim: ContextBuilder detecta conventions E Role detecta conventions.)
- "A transformação **observação** está pura?" (Não: contaminada por 'relevância' e default 'npm'.)

### O que o modelo de transformação revela imediatamente

Reescrevendo os 5 estágios e marcando onde cada um vaza:

```
observação        → CONTAMINADA (relevância + default npm embutem juízo)
seleção/leitura   → limpa
interpretação     → DUPLICADA (ocorre em dois lugares do pipeline)
destilação        → limpa (Role → artifacts)
inscrição         → limpa (persiste o recebido)
```

Duas das cinco transformações têm defeito. E o defeito não é "uma caixa faz demais" — é "uma **transformação** está no lugar errado ou repetida". Este enquadramento localiza o problema com muito mais precisão do que "Context está inchado".

### A implicação mais profunda

Se o Harness é transformação de informação, então **Context, ProjectMetadata, RoleOutput não são componentes — são estados da informação entre transformações**.

Isso muda tudo: "Context inchado" deixa de ser problema de design de classe e vira **"o estado da informação neste ponto carrega coisas que nenhuma transformação seguinte transforma"**. Carga morta no fluxo, não campo redundante numa struct.

---

## Pergunta 4: Responsabilidade mal atribuída ainda não identificada?

Além da já conhecida (ContextBuilder interpreta), **sim, duas.**

### Mal-atribuição nº 1: Quem define "relevância" (já discutida acima)

A seleção de arquivos relevantes está atribuída à fase de observação, mas relevância é função da intenção. A observação não deveria ter autoridade para decidir relevância — ela não conhece a intenção (ela roda antes da intenção ser usada).

**Ninguém é o proprietário legítimo de "relevância" hoje** — ela é exercida por quem coleta, que é o agente com menos direito a ela.

### Mal-atribuição nº 2: Quem decide o default na incerteza

`packageManager: 'npm'` quando nada é encontrado.

A decisão "na ausência de evidência, assuma o caso mais comum" é uma **política**, não uma observação. A observação deveria ter direito apenas a dizer "não encontrei". Transformar "não encontrei" em "é npm" é um juízo — e está atribuído à fase que deveria ser mais neutra de todas.

Consequência rastreada na evidência: o default "npm" propaga-se e faz o Role gerar "constraint: sem testes npm" para um projeto PHP. **Um juízo errado na observação envenena toda a cadeia.** É a mal-atribuição mais perigosa porque é a mais a montante.

### Mal-atribuição potencial nº 3: A fronteira do "objetivo"

`objective` entra no pipeline mas só é consumido para logging no final. Se o Conceito nº 1 (intenção condiciona observação) estiver certo, então o **proprietário do objetivo está errado**: hoje ele pertence ao fim do fluxo, mas deveria condicionar o início.

O objetivo está sendo tratado como *carga transportada* quando deveria ser *força que molda* cada transformação.

---

## Pergunta 5: Hipótese assumida como verdadeira sem percebermos?

**Sim. Cinco hipóteses ocultas.**

### Hipótese oculta nº 1: "Existe um conjunto de fatos objetivo, independente da intenção"

Assumido em ADR-004. Refutado pela evidência PHP (a ausência de test script só é 'fato' sob uma intenção). **É a hipótese mais carregada e menos examinada de todo o projeto.**

### Hipótese oculta nº 2: "Observação precede interpretação no tempo"

Assumimos ordem sequencial: primeiro observa, depois interpreta. Mas o Conceito nº 1 e nº 3 sugerem que interpretação e observação são **co-dependentes** — você observa através de uma lente interpretativa. A sequencialidade pode ser uma imposição da arquitetura de pipeline, não uma verdade do domínio.

### Hipótese oculta nº 3: "Um projeto tem uma natureza única e detectável"

`mainFramework` (singular). `packageManager` (singular). A evidência WordPress refuta: é PHP **e** npm simultaneamente. Assumimos natureza singular; a realidade é composta. O modelo força uma escolha ("é npm") onde a verdade é conjunção ("é ambos").

### Hipótese oculta nº 4: "O pipeline é unidirecional"

ADR e desenhos mostram fluxo linear →. Mas a evidência do Reviewer simulado mostra que ele consumiria `constraints` que o Dev produz. Isso é informação de um Role servindo de entrada a outro. O modelo linear (fatos → significado → fim) não comporta **significado que vira insumo de mais significado**. Assumimos linha; pode ser grafo.

### Hipótese oculta nº 5: "Persistir conhecimento é o fim do fluxo"

O último estágio é inscrição em disco. Mas se conhecimento persistido nunca é relido na próxima execução (a evidência: MemoryWriter escreve, ninguém carrega de volta), então ou (a) o fim está incompleto, ou (b) estamos persistindo por fé, sem consumidor. Assumimos que "persistir = valor" sem evidência de que o conhecimento persistido fecha algum ciclo.

---

## Síntese: O Modelo Conceitual Que a Evidência Sugere

Descrito puramente como informação, sem uma única classe:

1. Uma **intenção** entra e deveria **iluminar** o lugar — decidir o que merece ser visto.
2. A **observação** ocorre sob essa luz, produzindo fatos *situados* (não fatos neutros).
3. Fatos situados carregam consigo seu **grau de inferência** (do puro-observado ao já-quase-julgado).
4. A **interpretação** destila fatos situados em significado, e esse significado **pode realimentar** novas observações ou outras interpretações.
5. O significado que **fecha um ciclo** (é relido, muda uma decisão futura) merece persistir; o resto é ruído.

Contra este modelo, o Harness atual:
- Trata a intenção como carga, não como luz. (Hip. 1, 2; Mal-atrib. 3)
- Finge que fatos são neutros. (Hip. 1; Conceito 1, 3)
- Assume fronteira nítida fato/interpretação. (Conceito 2)
- Assume natureza singular do projeto. (Hip. 3)
- Assume fluxo linear. (Hip. 4)
- Persiste sem evidência de ciclo fechado. (Hip. 5)

---

## O Que NÃO Estou Afirmando

- Não afirmo que a arquitetura atual está errada. Ela **funciona** para o caso Node.js, com evidência.
- Não proponho refatoração. A pergunta era conceitual.
- Não afirmo que todas as 5 hipóteses ocultas são falsas — afirmo que são **assumidas sem terem sido testadas**, e que a disciplina do projeto exige testá-las antes de tratá-las como verdade.

---

## A Única Recomendação (Metodológica, Não Arquitetural)

O projeto foi rigoroso em testar hipóteses **explícitas**. As cinco hipóteses **ocultas** acima nunca viraram experimento porque nunca foram enunciadas.

A próxima descoberta mais valiosa provavelmente não é sobre Context, ProjectLoader ou PHP.

É escolher **uma** das hipóteses ocultas — a nº 1 ("existe fato independente de intenção") é a raiz das outras — e desenhar um experimento que a ataque diretamente.

Se ela cair, o modelo inteiro se reorganiza sozinho, como o ContextBuilder se reorganizou quando "interpretação pertence ao Role" foi validado.

---

**Status:** CRÍTICA CONCEITUAL
**Decisões arquiteturais:** NENHUMA
**Hipóteses ocultas expostas:** 5
**Conceitos fundamentais propostos:** 3
**Próximo passo sugerido:** Enunciar e testar a Hipótese Oculta nº 1
