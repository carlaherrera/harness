# A Natureza da Informação no Harness

> Investigação epistemológica. O que é um fato dentro do Harness?
> Sem arquitetura. Sem código. Sem componentes.
> Questionamento das palavras herdadas.
>
> Data: 2026-07-12
> Método: Hipótese → Experimento → Observação → Comparação

---

## Por Que Esta Investigação

A revisão conceitual levantou: "relevância pode ser interpretação disfarçada de observação".

Se isso for verdade, então a palavra **"fato"** — usada em ADR-004 ("ProjectLoader coleta fatos") — pode estar semanticamente errada.

Antes de decidir qualquer coisa, precisamos saber: **o que é um fato?**

---

## Parte I: Sete Categorias Epistemológicas

Definições operacionais antes de classificar. Estas definições são ferramentas de corte, não verdades.

| Categoria | Definição operacional | Teste decisivo |
|-----------|----------------------|----------------|
| **Observação** | Registro direto de um estado do mundo, sem afirmação sobre seu significado | "Vi X" — pode ser feito por um sensor cego |
| **Fato** | Uma observação que foi **aceita como verdadeira** dentro de um quadro de referência | "X é o caso" — requer alguém que aceite |
| **Inferência** | Conclusão derivada de observações por uma regra | "Se X e Y, então Z" — requer uma regra |
| **Hipótese** | Uma inferência ainda não confirmada, tratada como provisória | "Talvez Z" — carrega dúvida explícita |
| **Interpretação** | Atribuição de significado a observações sob um propósito | "X significa W para o fim P" — requer propósito |
| **Decisão** | Escolha entre alternativas quando a evidência não determina univocamente | "Na dúvida, escolho A" — requer política |
| **Conhecimento** | Interpretação que foi validada e pode reorientar ação futura | "Sei W, e isso muda o que farei" — requer ciclo fechado |

Nota crítica: estas categorias formam uma **cadeia de dependência crescente de um sujeito**. Observação quase não precisa de sujeito. Conhecimento precisa de um sujeito com propósito, memória e capacidade de agir. A questão central do Harness é: **em que ponto desta cadeia o sistema está operando, e onde ele acha que está?**

---

## Parte II: Classificação de Cada Informação do Pipeline

Para cada informação que circula hoje, aplico as sete categorias. Anoto o que o sistema **afirma** que ela é (via ADR-004: "fatos") versus o que ela **é**.

### "existe um arquivo chamado package.json"

- **O que é:** OBSERVAÇÃO pura. Um sensor cego (ls) produz isto sem juízo.
- **Sistema afirma:** fato.
- **Veredito:** É observação. Vira fato apenas quando alguém aceita "sim, este arquivo existe e isto importa". A existência é observável; a menção dela já seleciona (por que este arquivo e não outro?).
- **Contaminação:** baixa. Mas a **escolha de observar este arquivo** já é interpretação (ver Parte IV).

### "a estrutura de diretórios é {app, Controllers, Models...}"

- **O que é:** OBSERVAÇÃO. Varredura mecânica do filesystem.
- **Veredito:** Observação quase pura. É o item mais próximo de "fato objetivo" no pipeline — porque não seleciona nem infere, apenas transcreve. Notar: até aqui há um recorte (profundidade máxima 2, ignora node_modules) — recorte é política (ver Parte IV).

### "tecnologia: TypeScript"

- **O que é:** INFERÊNCIA. Ninguém observou "TypeScript". Observou-se `typescript` na lista de dependências, ou a existência de `tsconfig.json`, e **aplicou-se a regra** "se existe tsconfig → usa TypeScript".
- **Sistema afirma:** fato.
- **Veredito:** É inferência apresentada como fato. A regra é boa (raramente erra), mas é uma regra. O que se observou foi um arquivo; "TypeScript" é conclusão.

### "packageManager: pnpm" (quando há pnpm-lock.yaml)

- **O que é:** INFERÊNCIA. Observou-se um lock file; inferiu-se o gerenciador pela regra "pnpm-lock → pnpm".
- **Veredito:** Inferência sólida. Ainda assim, inferência, não observação.

### "packageManager: npm" (quando NÃO há lock file nenhum)

- **O que é:** DECISÃO. Nenhuma observação suporta "npm" aqui — não há lock file. O sistema **escolheu** npm como default na ausência de evidência.
- **Sistema afirma:** fato.
- **Veredito:** É uma DECISÃO travestida de fato. Este é o caso mais grave do pipeline inteiro. Não é observação (nada foi visto), não é inferência (não há premissa), não é hipótese (não se admite dúvida). É uma **política** ("na dúvida, npm") apresentada como se o mundo a tivesse ditado. A evidência PHP mostra o dano: propaga-se como se fosse verdade.

### "mainFramework: Next.js"

- **O que é:** INFERÊNCIA de segunda ordem. Deriva de "technologies inclui Next.js", que já era inferência. Inferência sobre inferência.
- **Veredito:** Inferência empilhada. Cada camada adiciona distância da observação. Ninguém consome este campo — talvez porque intuitivamente se sente que é "longe demais do observado" para ser confiável.

### "relevantFiles: [package.json, tsconfig, CLAUDE.md, README]"

- **O que é:** INTERPRETAÇÃO. "Relevante" é atribuição de significado sob um propósito. Nenhuma propriedade física de um arquivo o torna "relevante" — a relevância existe só em relação a um fim.
- **Sistema afirma:** fato (implícito — está no ProjectMetadata junto com os demais "fatos").
- **Veredito:** É INTERPRETAÇÃO pura, rotulada como coleta. A hipótese da revisão conceitual se confirma aqui. "Relevância" não é disfarce ocasional — é interpretação estrutural embutida na fase que se declara neutra. E é interpretação sob um propósito **não declarado** (o propósito Node.js), o que a torna duplamente oculta.

### "constraint: não há test script"

- **O que é:** INTERPRETAÇÃO sob uma intenção não-explícita. "Não há test script" é observação de ausência; "isto é uma constraint (um problema)" é juízo de que testes deveriam existir.
- **Veredito:** Interpretação. E interpretação que assume uma norma ("projetos devem ter testes npm") como universal. Falsa para PHP.

### "convention: usa Conventional Commits"

- **O que é:** INFERÊNCIA a partir de leitura de conteúdo (achou a string "Conventional Commits" no CLAUDE.md).
- **Veredito:** Inferência razoável. Mas note: é inferência de que "mencionar = adotar", que nem sempre vale.

### "artifact: projeto usa TypeScript para type safety"

- **O que é:** INTERPRETAÇÃO destilada, candidata a CONHECIMENTO.
- **Veredito:** É a única categoria alta que o pipeline produz — mas só vira conhecimento se fechar ciclo (for relido e mudar ação futura). Como nada relê (Hipótese Oculta nº 5), permanece interpretação persistida, não conhecimento. **O sistema chama de "knowledge artifact" algo que ainda não é conhecimento.** Erro semântico no nome.

### "objective: analyze project structure"

- **O que é:** Nem observação nem fato. É uma **intenção**. Uma oitava categoria que a lista não previu.
- **Veredito:** Ver Parte V — a intenção é uma categoria à parte, e seu mau-posicionamento é central.

---

## Parte III: Tabela-Síntese da Classificação

| Informação | Categoria real | Sistema chama de | Erro semântico? |
|------------|---------------|------------------|-----------------|
| existe package.json | observação | fato | leve |
| estrutura de diretórios | observação | fato | leve |
| technologies: TypeScript | inferência | fato | **sim** |
| packageManager: pnpm | inferência | fato | **sim** |
| packageManager: npm (default) | **decisão** | fato | **grave** |
| mainFramework | inferência² | fato | **sim** |
| relevantFiles | **interpretação** | fato/coleta | **grave** |
| constraint: sem testes | interpretação | (Role: ok) | correto agora |
| convention: commits | inferência | (Role: ok) | correto agora |
| artifact | interpretação | **conhecimento** | **sim** |
| objective | **intenção** | (input) | mal-posicionado |

**Observação sobre o padrão:** os erros semânticos graves concentram-se na fase que o sistema chama de "coleta de fatos". Nenhum está na fase de interpretação do Role. Ou seja: **a fase que se declara mais objetiva é a que mais mente sobre a natureza do que produz.**

---

## Parte IV: Quando uma Observação Vira Fato?

### A transição não é temporal, é epistêmica

Uma observação vira fato **quando um sujeito com um quadro de referência a aceita como verdadeira**. Não é uma passagem de tempo; é um ato de aceitação.

Isto tem consequência imediata para o Harness: **um sensor cego produz observações, não fatos.** Fatos requerem um aceitante. Quem é o aceitante no Harness?

- Se é "o próprio pipeline, mecanicamente" — então "fato" significa apenas "observação que registramos". É um uso empobrecido da palavra, mas defensável, desde que consciente.
- Se é "o Role, que aceita as observações sob sua intenção" — então **os fatos não existem antes do Role**. Antes do Role há só observações. E ADR-004 ("componentes coletam fatos") estaria nomeando errado: componentes coletam **observações**; fatos nascem no encontro com uma intenção.

A evidência favorece a segunda leitura. A prova é a "constraint: sem testes": a mesma observação ("não há test script") é fato-relevante para um projeto Node e não-fato para PHP. **A observação é idêntica; o que muda é a aceitação sob intenção.** Logo o estatuto de "fato" não está na observação — está na relação observação-intenção.

### Conclusão da Parte IV

> Uma observação vira fato quando aceita por um sujeito sob um quadro de referência. No Harness, esse sujeito é o Role (que traz a intenção). Portanto **o pipeline, antes do Role, não deveria dizer que transporta fatos. Transporta observações.**

---

## Parte V: Existe Fato Independente de Intenção?

Esta é a pergunta-raiz (Hipótese Oculta nº 1). Respondo com uma distinção que a análise tornou inevitável.

### Distinção necessária: observável-independente vs. fato-contextualizado

**Existe observação independente de intenção.** "Este arquivo existe", "esta pasta se chama Controllers" — verdadeiros independentemente de qualquer propósito. O mundo tem estados que qualquer sensor registraria igual.

**Não existe fato independente de intenção** — se "fato" significa "observação aceita como relevante/verdadeira dentro de um quadro". Porque "relevante" e "dentro de um quadro" já importam propósito. Uma observação torna-se um fato-para-alguém-com-um-fim.

### O erro do Harness em uma frase

O Harness colapsou duas coisas distintas na palavra "fato":
1. o observável-independente (que existe sem intenção)
2. o fato-contextualizado (que não existe sem intenção)

E ao coletar `relevantFiles` e o default `npm`, ele importou intenção (Node.js) para dentro do que chamava de "observável-independente". **Contrabandeou um fato-contextualizado (contexto Node.js) para dentro da fase que deveria conter só observável-independente.**

### Resposta direta às três formulações da pergunta

> **Existe fato independente de intenção?**
> Não, se "fato" = observação-aceita-como-relevante. Sim, se você chamar isso de "observação" e reservar "fato" para o que já passou por uma intenção.

> **Ou existe apenas observação objetiva e fatos contextualizados?**
> Esta terceira formulação é a correta. Há **observação objetiva** (independente de intenção) e **fatos contextualizados** (observação + intenção). São duas coisas, e o Harness precisa de duas palavras, não uma.

A hipótese oculta nº 1 ("existe fato independente de intenção") está, portanto, **refutada na forma em que foi assumida** — mas o que a substitui não é "tudo é interpretação". É uma distinção de dois níveis: observação (objetiva) e fato (contextualizado). O nível objetivo existe; ele só não é o que o pipeline está transportando quando diz "fatos".

---

## Parte VI: O Pipeline Deve Transportar Observações ou Fatos?

Dada a Parte V, a pergunta se dissolve numa escolha clara:

**Se o pipeline transporta OBSERVAÇÕES:**
- Ele carrega o observável-independente, neutro, sem intenção.
- O Role recebe observações e, sob sua intenção, as converte em fatos-contextualizados.
- Consequência: relevância, defaults, e toda seleção-com-propósito **não podem** ocorrer antes do Role. A observação teria que ser cega e completa (ou cega e recortada só por política explícita, não por relevância).

**Se o pipeline transporta FATOS:**
- Ele carrega observação-já-contextualizada.
- Mas então precisa de uma intenção **antes** para contextualizar — o que exige que a intenção esteja presente desde o início (confirmando o Conceito nº 1 da revisão anterior).
- Consequência: não haveria "fase neutra"; toda coleta seria já-interpretativa e assumidamente.

**O que o Harness faz hoje:** afirma transportar fatos, projetou-se para transportar observações neutras, e **na prática transporta observações contaminadas por uma intenção não-declarada (Node.js)**. É o pior dos três: nem neutro assumido, nem contextualizado assumido, mas contextualizado-escondido.

Não decido qual das duas é a correta — a pergunta pedia investigação. Mas a análise mostra que **as duas são coerentes e a atual não é.** O defeito não é escolher observação ou fato; é não ter escolhido, e mentir sobre a escolha.

---

## Parte VII: Confundimos Política de Observação com Observação?

**Sim. Definitivamente. E este é o achado mais limpo da investigação.**

### O que é política de observação

Toda observação real é recortada. Decisões como:
- "olhar até profundidade 2"
- "ignorar node_modules"
- "considerar estes 4 arquivos relevantes"
- "na ausência de lock file, assumir npm"

...são **políticas de observação**: regras sobre *como* e *o que* observar. Não são observações — são decisões que moldam a observação.

### A confusão

O Harness embutiu políticas de observação **dentro do resultado da observação**, sem marcá-las como políticas. O resultado (`packageManager: npm`) não carrega a informação de que foi produzido por uma política ("assumi npm porque não achei nada"). Ele se apresenta idêntico a um resultado observado ("achei pnpm-lock, logo pnpm").

**Dois resultados com estatutos epistêmicos radicalmente diferentes — um observado, um decidido por política — têm exatamente a mesma forma no pipeline.** Impossível, a jusante, distinguir "isto foi visto" de "isto foi assumido". Essa indistinção é a doença.

### Por que isto importa mais que qualquer questão de componente

Um sistema que não distingue "vi X" de "assumi X na falta de evidência" **não pode raciocinar sobre sua própria confiança**. Ele trata suposições com a mesma autoridade que evidências. Todo erro downstream que rastreamos (constraints falsas em PHP) tem esta raiz: uma política de observação (default npm, relevância Node) que se fez passar por observação.

---

## Parte VIII: Palavras Que Estão Semanticamente Erradas

Questionamento das palavras herdadas, como pedido.

| Palavra usada | Uso atual | Problema | Palavra que a evidência pede |
|---------------|-----------|----------|------------------------------|
| **"fato"** (ADR-004) | tudo que o pipeline coleta | Inclui inferências, decisões e interpretações | "observação" para a fase neutra; reservar "fato" para pós-intenção |
| **"relevante"** (RelevantFiles) | arquivos que o pipeline lê | Relevância é interpretação sob propósito, não propriedade do arquivo | "arquivos seletados pela política P" — nomear a política |
| **"contexto"** (Context) | o pacote que vai ao Role | Se contém interpretação, não é contexto neutro; se não contém, o nome cabe | investigar: é "observações" ou "situação-interpretada"? |
| **"conhecimento"** (KnowledgeArtifact) | o que se persiste | Não fecha ciclo (nada relê), logo não reorienta ação — não é conhecimento | "interpretação persistida" até que um ciclo a valide |
| **"detecta"** (detectTechnologies, etc.) | as funções de coleta | "Detectar" sugere revelar algo que está lá; muitas vezes é inferir ou decidir | "inferir" quando há regra; "assumir" quando há default |

Padrão: **todas as palavras erradas inflam o estatuto epistêmico.** "Observação" virou "fato". "Seleção" virou "relevância". "Inferência" virou "detecção". "Interpretação persistida" virou "conhecimento". O vocabulário do Harness sistematicamente afirma mais certeza do que a informação possui.

---

## Síntese Final da Investigação

### O que descobrimos sobre a natureza da informação no Harness

1. O pipeline transporta majoritariamente **observações e inferências**, não fatos.
2. Chama tudo de "fato", inflando o estatuto epistêmico de tudo.
3. Um item (`npm` default) não é nem observação nem inferência — é **decisão** disfarçada, e é a mais a montante, logo a mais perigosa.
4. "Relevância" é **interpretação estrutural** embutida na fase dita neutra — a hipótese que abriu esta investigação está **confirmada**.
5. Não existe fato independente de intenção; existe **observação objetiva** (independente) e **fato contextualizado** (dependente). O Harness colapsou os dois.
6. O sistema **confunde política de observação com observação** e, por isso, não pode distinguir o que viu do que assumiu.
7. Cinco palavras centrais ("fato", "relevante", "contexto", "conhecimento", "detecta") afirmam mais certeza do que a informação carrega.

### A pergunta que fica para o próximo ciclo

Se o pipeline transporta observações que fingem ser fatos, e políticas de observação que fingem ser observações — então **a próxima investigação natural não é sobre informação, mas sobre confiança**:

> O Harness deveria carregar, junto de cada informação, o seu estatuto epistêmico e sua proveniência (foi vista? inferida? assumida? sob qual política?)?

Não respondo. Apenas registro que a investigação da *natureza* da informação leva inevitavelmente à investigação da *proveniência e confiança* da informação.

---

**Status:** INVESTIGAÇÃO EPISTEMOLÓGICA
**Decisões arquiteturais:** NENHUMA
**Hipótese "relevância = interpretação":** CONFIRMADA
**Hipótese oculta nº 1 "fato independente de intenção":** REFUTADA na forma assumida; substituída pela distinção observação/fato-contextualizado
**Palavras semanticamente questionadas:** 5
**Próxima pergunta emergente:** proveniência e estatuto epistêmico como parte da informação
