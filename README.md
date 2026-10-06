# 🏛️ Mapa do Poder

**Quantas pessoas giram em volta do poder público no Brasil?**

Uma árvore interativa que mostra quantos políticos, ministros e assessores o Estado brasileiro sustenta, do Executivo Federal às câmaras municipais, e quanto isso custa.

### 👉 [Acesse o site](https://wkliemann.github.io/mapa-do-poder-brasil/)

> ⚠️ **Projeto apartidário.** O site não cita partidos, nomes, governos nem ideologias. Ele mostra a **estrutura** do Estado, que existe independente de quem vence a eleição.

---

## Como funciona

Cada galho da árvore mostra primeiro **uma unidade**: o gabinete de um deputado, um senador, uma cidade. Depois ela é multiplicada pelo total de cargos:

```
1 deputado federal + até 25 assessores  =  26 pessoas
                     × 513 deputados
                     = 13.338 pessoas · R$ 1,63 bi/ano
```

Os números são traduzidos em coisas do dia a dia: Maracanãs lotados, ônibus, aviões, professores e creches.

## Alguns números

| | |
|---|---|
| 👥 Pessoas mapeadas | **160 mil**, o suficiente para lotar o Maracanã 2 vezes |
| 💰 Custo estimado | **R$ 19 bi/ano** (piso) |
| 🏛️ Assessores que o Congresso pode contratar | **17.280** |
| 🧑‍💼 Cargos comissionados no governo federal | **50.770** |
| 🏘️ Vereadores | **58.072**, em 5.569 cidades |

## O que está incluído

- **Executivo Federal:** presidente, vice, 38 ministérios e cargos de confiança
- **Congresso Nacional:** 81 senadores e 513 deputados federais, por estado
- **Estados:** governadores, vices e 1.059 deputados estaduais
- **Municípios:** prefeitos, vices e vereadores
- **Seu estado:** escolha um estado e veja a bancada dele

## Metodologia

- Os assessores aparecem no **limite máximo permitido** por lei ou regimento. Nem todo parlamentar usa o limite inteiro.
- O custo é um **piso**. Ele soma só o que dá para estimar com dados públicos. Os comissionados federais, os governadores, os prefeitos e boa parte das assembleias ficam de fora.
- Números aproximados, como a média de assessores nas assembleias estaduais, estão marcados como estimativa.
- Os valores são de 2025/2026. Todas as fontes têm link no rodapé do site.

Encontrou um número errado ou desatualizado? [Abra uma issue](https://github.com/wkliemann/mapa-do-poder-brasil/issues) com a fonte.

---

## Para desenvolvedores

É um site estático em HTML, CSS e JavaScript puro, sem dependências nem build.

```
index.html      página
css/style.css   estilos
js/data.js      todos os números e fontes
js/app.js       árvore, bonequinhos, comparações e contador
```

**Rodar localmente:** abra o `index.html` no navegador.

**Atualizar os números:** edite o `js/data.js`. Ali ficam os valores de referência (`REF`), as comparações do dia a dia (`DIA_A_DIA`), as bancadas por estado (`ESTADOS`) e as fontes (`FONTES`).

**Publicar:** o site sai pelo GitHub Pages (branch `main`, raiz) a cada push. Quando mudar o CSS ou o JS, aumente o `?v=` nas tags do `index.html`. Senão o navegador continua usando a versão antiga em cache.

**Contador de visitas:** usa o [Abacus](https://abacus.jasoncameron.dev), que é gratuito e não exige cadastro.

---

Feito pelo Claude, com os tokens do [William Kliemann](https://www.linkedin.com/in/william-kliemann-297b80a3/).
