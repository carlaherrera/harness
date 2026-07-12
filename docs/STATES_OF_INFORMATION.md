# Estados da Informação — A Cadeia Realidade→Conhecimento

> Investigação: o Harness manipula "fatos" ou estados da informação?
> Teste da afirmação "antes do Role não há fatos, apenas observações".
> Sem arquitetura. Sem código. Epistemologia primeiro.
>
> Data: 2026-07-12
> Método: Hipótese → Experimento → Observação → Comparação

---

## A Cadeia em Investigação

```
Realidade
  ↓
Observação
  ↓
Evidência
  ↓
Inferência
  ↓
Interpretação
  ↓
Conhecimento
```

Seis estados. A hipótese sob teste: esta cadeia descreve a informação melhor do que a palavra "fato", e "fato" pode ser dispensável.

Antes de analisar transições, um princípio de método: vou tratar cada seta (↓) como uma **transformação que adiciona algo que não estava presente antes**. Se uma seta não adiciona nada, os dois estados que ela liga são o mesmo estado com nomes diferentes — e um dos nomes é supérfluo. Este é o teste que vai revelar se "fato" (e outras palavras) sobra.

---

## Parte I: O Que Diferencia Cada Etapa da Seguinte

### Realidade → Observação

**O que é adicionado:** um recorte e um registrador.

A Realidade é tudo que é o caso, infinita e indiferente. A Observação é um **registro finito** de uma fração dela, produzido por um registrador situado (um sensor, um olho, um `ls`).

A diferença decisiva: a Realidade não tem ponto de vista; a Observação **sempre tem**. Toda observação é de algum lugar, com algum recorte, alguma resolução. Não existe observação onilateral — isso seria a própria Realidade.

**Consequência já aqui:** o recorte da observação é uma escolha (uma política). A Realidade não escolhe o que mostrar; o observador escolhe o que olhar. A "política de observação" do documento anterior nasce nesta primeira seta, e é inevitável — não há observação sem recorte.

### Observação → Evidência

**O que é adicionado:** uma pergunta. Uma direção de relevância.

Uma observação torna-se evidência **quando é posta em relação a uma pergunta**. "Há um pnpm-lock.yaml" é observação. Vira evidência no instante em que existe a pergunta "qual gerenciador de pacotes?" — aí a observação passa a *apontar para* uma resposta.

A diferença decisiva: observação é registro; evidência é registro **orientado**. Evidência é sempre evidência-de-algo, evidência-para-uma-pergunta. Sem pergunta, uma observação é apenas um registro inerte — verdadeiro, mas mudo.

**Isto é o achado central desta seta:** evidência já contém direcionalidade. Não é neutra da forma que observação é. Guardar isto — vai decidir se "evidência" pode substituir "fato".

### Evidência → Inferência

**O que é adicionado:** uma regra e um salto.

A Inferência aplica uma regra à evidência para produzir uma afirmação que **vai além do observado**. Evidência: "existe tsconfig.json". Regra: "tsconfig ⇒ usa TypeScript". Inferência: "usa TypeScript".

A diferença decisiva: a evidência está *contida* no observado; a inferência **excede** o observado. Ninguém viu "TypeScript" — viu-se um arquivo, e saltou-se. Todo salto pode errar (o tsconfig pode ser vestigial, órfão). Por isso a inferência carrega, intrinsecamente, um **grau de confiança** que a evidência não precisava carregar.

### Inferência → Interpretação

**O que é adicionado:** um propósito. Um "e daí?".

A Interpretação atribui **significado** à inferência sob um fim. Inferência: "usa TypeScript". Interpretação (sob o fim 'revisar código'): "então espero tipagem estrita, e ausência dela é um problema".

A diferença decisiva: inferência responde "o que é o caso?"; interpretação responde "o que isto significa **para o que quero fazer**?". A inferência é a mesma para todos; a interpretação varia com o propósito. Dois propósitos diferentes interpretam a mesma inferência de modos diferentes — daí "sem test script" ser problema para um fim e irrelevante para outro.

### Interpretação → Conhecimento

**O que é adicionado:** validação e capacidade de reorientar ação futura.

O Conhecimento é interpretação que (a) sobreviveu a algum teste de validade e (b) pode **mudar uma decisão futura**. Interpretação: "ausência de testes é um risco aqui". Vira conhecimento quando é confirmada e quando, na próxima vez, **altera o que se faz** ("neste tipo de projeto, sempre verifico testes primeiro").

A diferença decisiva: interpretação é um significado *momentâneo*, ligado a uma execução; conhecimento é um significado *estabilizado*, que persiste e reorienta. Interpretação que nunca reorienta nada não é conhecimento — é opinião registrada.

---

## Parte II: Existe Necessidade da Palavra "Fato"?

### Onde "fato" tentaria se encaixar

Aplico o teste da seta. "Fato" pretende nomear um estado da informação. Qual? Percorro a cadeia procurando o buraco que "fato" preencheria:

- É a Realidade? Não — fato é sempre proposicional ("X é o caso"), a Realidade é pré-proposicional.
- É a Observação? Parcialmente — mas observação não afirma verdade, só registra. "Fato" afirma verdade.
- É a Evidência? Aqui "fato" quase encaixa: uma evidência aceita como verdadeira. Mas evidência já diz isso, e diz **mais** (diz que é orientada a uma pergunta).
- É a Inferência? Não — chamamos inferências de "fato" por erro (o documento anterior mostrou), mas inferência excede o observado; fato não deveria.

**"Fato" não tem um estado próprio na cadeia.** Ele paira sobre observação/evidência/inferência sem se fixar em nenhum. É por isso que no Harness ele foi aplicado a todos os três indistintamente — porque não nomeia nenhum especificamente.

### O que "fato" realmente carrega

"Fato" carrega uma coisa que os outros termos não carregam explicitamente: a **pretensão de verdade estabelecida e não-controversa**. Dizer "é um fato" é dizer "isto está encerrado, não se discute". 

É exatamente essa pretensão que causa o dano. Quando o Harness chama uma inferência ou uma decisão-default de "fato", ele importa a aura de "não-se-discute" para algo que deveria ser discutível. **A palavra "fato" não descreve o estado da informação — ela suprime a dúvida que o estado ainda merecia.**

### Veredito sobre "fato"

> "Fato" é dispensável **e ativamente prejudicial** neste modelo. Dispensável porque não nomeia nenhum estado que os outros seis termos não nomeiem melhor. Prejudicial porque sua única contribuição semântica — a pretensão de verdade encerrada — é precisamente o que faz o sistema tratar suposições como certezas.

Recomendo abandoná-la. Não como preferência estilística — como correção de um erro de modelagem. Cada vez que dizemos "fato", deveríamos dizer o estado específico: observação, evidência, ou inferência. A perda de conveniência é o ganho de honestidade.

---

## Parte III: "Evidência" Descreve Melhor o Que Chamamos de "Fato"?

**Parcialmente. Melhor que "fato", mas não é substituto universal.**

### Onde "evidência" é superior

Evidência tem três virtudes que "fato" não tem:

1. **É relacional, não absoluta.** Evidência é sempre evidência-para-uma-pergunta. Isso força a pergunta a ser explícita, o que combate o auto-engano de "coleta neutra".
2. **Admite grau.** Fala-se de evidência forte, fraca, ambígua. "Fato" é binário (é ou não é). A realidade da informação tem gradação.
3. **Aponta para proveniência.** Evidência implica "evidência a partir de quê?" — carrega, no próprio conceito, a exigência de origem.

### Onde "evidência" NÃO substitui "fato"

Aqui está a sutileza que quase se perde: **"evidência" não pode nomear o observável-independente.**

"Existe um arquivo package.json" — antes de qualquer pergunta — não é evidência de nada ainda. É observação pura. Ela **vira** evidência quando uma pergunta a orienta. Se usarmos "evidência" para tudo, perdemos a capacidade de falar do estado *pré-pergunta* — o registro bruto antes de ser orientado.

Então:

> "Evidência" descreve melhor do que "fato" aquilo que o Harness coletava **quando havia uma pergunta implícita** (quase sempre havia: a pergunta Node.js). Mas "evidência" não descreve o registro bruto pré-pergunta. Para esse, "observação" é a palavra.

### A substituição correta não é uma palavra, são duas

O que o Harness chamava de "fato" deve ser **desdobrado** em:
- **observação** — o registro bruto, pré-pergunta, independente de intenção
- **evidência** — a observação já orientada por uma pergunta

E o que ele chamava de "fato" mas era salto (`TypeScript`, `npm-default`) nunca foi nem observação nem evidência — era **inferência** ou **decisão**, e deve ser chamado assim.

Uma palavra ("fato") escondia quatro estados distintos. Substituí-la por uma única palavra ("evidência") esconderia dois deles. A cura não é trocar a palavra — é **parar de usar uma palavra para quatro coisas**.

---

## Parte IV: Uma Inferência Pode Ser Produzida Sem Evidência Rastreável?

**Tecnicamente sim. Legitimamente não. E o caso onde isso acontece é o mais perigoso.**

### O caso da inferência sem evidência

Percorro a cadeia: inferência normalmente = evidência + regra. Mas há um caso onde uma afirmação com forma de inferência é produzida **sem evidência a montante**:

O default. "packageManager: npm" quando não há lock file nenhum.

Não há evidência ("não encontrei lock" é ausência de evidência, não evidência). Não há regra aplicada a um observado (não há observado). Há apenas uma **política**: "na ausência, assuma o comum". O resultado tem a *forma* de uma inferência ("o gerenciador é npm") mas a *natureza* de uma decisão sem lastro.

### Por que isto é o mais perigoso

Uma inferência com evidência rastreável pode ser **auditada**: pode-se voltar à evidência e perguntar "a regra foi bem aplicada? a evidência era boa?". Uma inferência sem evidência rastreável **não tem a que voltar**. Ela é um ponto cego permanente — afirma algo e não há trilha que a justifique.

Quando tal afirmação entra na cadeia disfarçada de inferência normal, ela **contamina tudo a jusante com uma falsa sensação de fundamento**. A interpretação que a usa assume que há evidência por trás (porque inferências têm evidência por trás), quando não há.

### Veredito

> Uma inferência legítima é, por definição, rastreável até evidência. Quando algo tem forma de inferência mas não é rastreável, não é inferência — é **decisão/postulado** ocupando o lugar de uma inferência. A rastreabilidade não é um luxo da inferência; é o que a distingue de um chute. **Perder a proveniência é perder a distinção entre inferir e chutar.**

Isto responde à pergunta e antecipa a Parte V: a proveniência não é decoração — é o que confere às afirmações seu estatuto epistêmico. Sem ela, todas as afirmações achatam-se ao mesmo nível.

---

## Parte V: O Conhecimento Organizacional Deve Preservar Toda a Linhagem?

**Sim. E a investigação inteira converge aqui — a proveniência não é um adendo ao modelo; é o que torna o modelo verdadeiro.**

### O argumento a partir da cadeia

Reconsidere a cadeia inteira como uma cadeia de **dependências**:

```
Conhecimento   depende de → Interpretação(ões)
Interpretação  depende de → Inferência(s) + um propósito
Inferência     depende de → Evidência(s) + uma regra
Evidência      depende de → Observação(ões) + uma pergunta
Observação     depende de → Realidade + um recorte
```

Cada estado superior **é o que é** por causa dos estados inferiores que o sustentam. Um conhecimento não é uma afirmação solta — é o *cume* de uma pirâmide de dependências. Retirar a pirâmide e guardar só o cume é guardar uma afirmação cuja verdade não se pode mais examinar.

### O que se perde ao descartar a linhagem

Sem proveniência preservada, o conhecimento organizacional torna-se **inauditável e infalsificável**:

- **Inauditável:** não se pode perguntar "por que sabemos isto?". A resposta ("porque um dia interpretamos assim, a partir de tal inferência, sobre tal evidência") foi jogada fora.
- **Infalsificável:** quando a realidade muda (o projeto migra de npm para pnpm), não se pode encontrar quais conhecimentos dependiam da evidência antiga para revisá-los. O conhecimento apodrece silenciosamente porque perdeu o vínculo com o que o fundava.
- **Não-compositível:** dois conhecimentos que se contradizem não podem ser reconciliados sem saber de onde cada um veio. Sem linhagem, a contradição é invisível.

### A distinção crucial: preservar linhagem ≠ preservar tudo

"Toda a linhagem" não significa "todos os dados brutos para sempre". Significa preservar a **cadeia de dependência**: cada afirmação sabe de que afirmações-inferiores depende e por qual transformação (qual pergunta, qual regra, qual propósito) chegou lá.

Isso permite duas operações que definem conhecimento organizacional saudável:
1. **Descida:** dado um conhecimento, descer até a observação que o funda ("mostre-me por quê").
2. **Invalidação em cascata:** dada uma observação que mudou, subir e marcar todo conhecimento que dependia dela como "a revisar".

Sem linhagem, nenhuma das duas é possível. Com linhagem, o conhecimento organizacional deixa de ser um cemitério de afirmações e vira um organismo que sabe de que se alimenta e o que morre quando uma fonte seca.

### Veredito

> O conhecimento organizacional **deve** preservar a linhagem — não por completude documental, mas porque a linhagem **é** a diferença entre conhecimento e boato. Uma afirmação sem proveniência é indistinguível de um chute que deu certo. Preservar a cadeia de dependência é o que permite que o conhecimento seja auditado, revisado quando a realidade muda, e reconciliado quando entra em contradição. Sem isso, "conhecimento organizacional" é um nome nobre para um monte de opiniões órfãs.

---

## Síntese: Estamos Modelando Corretamente a Natureza da Informação?

### O que a investigação estabeleceu

1. **A cadeia de seis estados é sólida.** Cada seta adiciona algo real e distinto: recorte, pergunta, regra/salto, propósito, validação/estabilização. Nenhuma seta é vazia. O modelo de estados é melhor que o modelo de "fato".

2. **"Fato" é dispensável e prejudicial.** Não nomeia nenhum estado próprio; sua única contribuição é a pretensão de verdade-encerrada, que é exatamente o mecanismo do auto-engano. Abandoná-la é correção, não estilo.

3. **"Evidência" é melhor que "fato" mas não universal.** Cobre a observação-orientada-por-pergunta. Não cobre a observação bruta pré-pergunta (isso é "observação") nem os saltos (isso é "inferência"). A cura é usar os termos específicos, não trocar uma palavra-guarda-chuva por outra.

4. **A afirmação "antes do Role não há fatos, apenas observações" está quase certa, mas imprecisa.** O correto: antes de uma **pergunta** não há evidência, só observação; antes de um **propósito** não há interpretação, só inferência. O Role traz o propósito, não a "factualidade". A factualidade (aceitação como verdadeiro) pode ocorrer em qualquer ponto onde um sujeito aceita — não é privilégio do Role. Então a afirmação original localiza corretamente que *algo* nasce no Role (o propósito → interpretação), mas errava ao chamar esse algo de "fato".

5. **Proveniência é constitutiva, não decorativa.** É o que distingue inferência de chute e conhecimento de boato. Deve ser preservada como cadeia de dependência.

### A resposta à pergunta do ciclo

> Não estávamos modelando corretamente. Usávamos uma palavra ("fato") que achata seis estados distintos em um só e que injeta falsa certeza. A cadeia Realidade→Observação→Evidência→Inferência→Interpretação→Conhecimento modela a informação com muito mais fidelidade — **desde que cada estado carregue a memória de qual estado o gerou**.

O modelo correto da informação no Harness não é uma lista de tipos de dado. É uma **cadeia de transformações com proveniência preservada**, onde cada afirmação conhece seu próprio estatuto epistêmico (que estado sou?) e sua própria linhagem (de que dependo?).

### A questão que isto abre (sem responder)

Se a informação é uma cadeia com proveniência, então a pergunta seguinte — que registro mas não investigo — é:

> Qual é a **menor unidade de informação** que ainda carrega estatuto epistêmico e proveniência? Uma afirmação solta ("usa TypeScript") não basta, pois não diz de onde veio. A unidade mínima parece ser algo como *afirmação + estado + linhagem* — nunca a afirmação nua.

Isto é a próxima camada. Não a toco agora.

---

**Status:** INVESTIGAÇÃO DA NATUREZA DA INFORMAÇÃO
**Decisões arquiteturais:** NENHUMA
**"Fato" — veredito:** dispensável e prejudicial; abandonar
**"Evidência" substitui "fato"?:** melhor, mas requer também "observação" e "inferência" — não é substituto único
**Cadeia de seis estados:** validada como modelo superior
**Proveniência:** constitutiva do conhecimento, não opcional
**Próxima camada emergente:** a unidade mínima de informação (afirmação + estado + linhagem)
