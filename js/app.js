// Mapa do Poder: árvore interativa dos cargos políticos do Brasil.
// Cada galho mostra primeiro UMA unidade (um gabinete, uma cidade) e depois multiplica.

const fmtInt = new Intl.NumberFormat("pt-BR");
const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fmtMoney(v) {
  if (v == null) return "custo não estimado";
  if (v >= 1e9) return `R$ ${(v / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} bi`;
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  return fmtBRL.format(v);
}

/* ---------- construção da árvore ---------- */

let nextId = 0;

// unit: { head: {label, detail, kind}, staff: [{n, label, kind, per?}], times, timesLabel, unitCost, unitCostNote }
function leaf(label, { sub = "", unit, people, cost = null, note = "", estimativa = false } = {}) {
  return { id: nextId++, label, sub, unit, note, estimativa, people, cost, costPartial: cost == null };
}

function group(label, children, { sub = "", note = "", info = [], unit = null } = {}) {
  return {
    id: nextId++, label, sub, note, children, info, unit,
    people: children.reduce((s, c) => s + c.people, 0),
    cost: children.reduce((s, c) => s + (c.cost || 0), 0),
    costPartial: children.some((c) => c.costPartial),
    estimativa: children.some((c) => c.estimativa),
  };
}

const comissionadosCarreira = Math.ceil(REF.comissionadosFederais * 0.6);
const comissionadosLivres = REF.comissionadosFederais - comissionadosCarreira;

const porFed = [...ESTADOS].sort((a, b) => b[2] - a[2]);
const porEst = [...ESTADOS].sort((a, b) => b[3] - a[3]);

const unidade = {
  senador: (times, timesLabel) => ({
    title: "Um gabinete de senador",
    head: { label: "1 senador", detail: "R$ 46.366,19/mês de salário", kind: "eleito" },
    staff: [{ n: REF.assessoresSenador, label: `até ${REF.assessoresSenador} cargos de confiança`, kind: "assessor" }],
    unitCost: custoAnual.senador, unitCostNote: "custo estimado do gabinete completo",
    times, timesLabel,
  }),
  depFederal: (times, timesLabel) => ({
    title: "Um gabinete de deputado federal",
    head: { label: "1 deputado federal", detail: "R$ 46.366,19/mês de salário", kind: "eleito" },
    staff: [{ n: REF.assessoresDep, label: `até ${REF.assessoresDep} secretários parlamentares`, kind: "assessor" }],
    unitCost: custoAnual.depFederal, unitCostNote: "salário + verba de gabinete + cota + moradia",
    times, timesLabel,
  }),
  depEstadual: (times, timesLabel) => ({
    title: "Um gabinete de deputado estadual",
    head: { label: "1 deputado estadual", detail: "até R$ 34.774,64/mês de salário", kind: "eleito" },
    staff: [{ n: REF.assessoresDepEstadual, label: `~${REF.assessoresDepEstadual} assessores (média estimada)`, kind: "assessor" }],
    unitCost: custoAnual.depEstadual, unitCostNote: "só o salário, sem contar o gabinete",
    times, timesLabel,
  }),
};

const executivoFederal = group("Poder Executivo Federal", [
  leaf("Presidente e vice-presidente", {
    people: 2,
    cost: 2 * custoAnual.agentePolitico,
    unit: {
      title: "O topo do Executivo",
      head: { label: "1 presidente", detail: "R$ 46.366,19/mês de salário", kind: "eleito" },
      staff: [{ n: 1, label: "1 vice-presidente", kind: "eleito" }],
      times: 1,
    },
  }),
  leaf("Ministérios e cargos de confiança", {
    people: REF.ministros + REF.comissionadosFederais,
    cost: REF.ministros * custoAnual.agentePolitico,
    unit: {
      title: "Toda a administração federal",
      head: { n: REF.ministros, label: `${REF.ministros} ministros`, detail: "R$ 46.366,19/mês de salário cada", kind: "nomeado" },
      staff: [
        { n: comissionadosCarreira, per: 500, label: `${fmtInt.format(comissionadosCarreira)} com servidores de carreira (mínimo de 60%)`, kind: "servidor" },
        { n: comissionadosLivres, per: 500, label: `até ${fmtInt.format(comissionadosLivres)} podem ser indicados de fora (máximo de 40%)`, kind: "assessor" },
      ],
      times: 1,
    },
    note: `São ${fmtInt.format(REF.comissionadosFederais)} cargos e funções de direção, chefia e assessoramento (nov/2025), o maior número da história. Eles NÃO são assessores pessoais dos ministros: estão espalhados por toda a administração federal, com 53% nos ministérios e o resto em autarquias e fundações, como INSS, Ibama e universidades. Pela Lei 14.204/2021, pelo menos 60% precisam ser ocupados por servidores concursados. O restante (até cerca de 20 mil) pode ser de livre nomeação, inclusive de pessoas de fora do serviço público. O custo considera só o salário dos ministros.`,
  }),
], { sub: "Presidência, ministérios e cargos de confiança" });

const senado = group("Senado Federal",
  porFed.map(([uf, nome]) => leaf(`${nome} (${uf})`, {
    sub: "3 senadores",
    people: 3 * (1 + REF.assessoresSenador),
    cost: 3 * custoAnual.senador,
    unit: unidade.senador(3, "senadores"),
  })),
  {
    sub: `81 senadores · 3 por estado · até ${REF.assessoresSenador} cargos de confiança cada`,
    unit: unidade.senador(81, "senadores"),
    note: "Cada estado tem 3 senadores, com mandato de 8 anos. Em 2026 os eleitores votaram em 2 nomes, que substituem os eleitos em 2018. O terceiro foi eleito em 2022 e fica até 2031. Custo estimado de R$ 596 mil por senador por mês, somando salário, gabinete, cotas e benefícios. Os assessores aparecem no limite máximo permitido. Abra um estado para ver a bancada dele.",
  });

const camara = group("Câmara dos Deputados",
  porFed.map(([uf, nome, fed]) => leaf(`${nome} (${uf})`, {
    sub: `${fed} deputados federais`,
    people: fed * (1 + REF.assessoresDep),
    cost: fed * custoAnual.depFederal,
    unit: unidade.depFederal(fed, "deputados"),
  })),
  {
    sub: `513 deputados · até ${REF.assessoresDep} secretários parlamentares cada`,
    unit: unidade.depFederal(513, "deputados"),
    note: "Cada deputado tem salário de R$ 46.366,19, verba de gabinete de até R$ 165.806,07/mês para pagar os assessores, cota parlamentar de R$ 36,5 mil a R$ 51,4 mil/mês e auxílio-moradia. O aumento para 531 deputados foi vetado. Abra um estado para ver a bancada dele.",
  });

const congresso = group("Congresso Nacional", [senado, camara], {
  sub: "Senado + Câmara dos Deputados",
  info: [`Além do custo da estrutura, o Orçamento de 2026 reserva <b>${fmtMoney(REF.emendas2026)}</b> em emendas parlamentares: dinheiro público que deputados e senadores escolhem para onde vai. Daria para construir <b>${fmtInt.format(Math.floor(REF.emendas2026 / DIA_A_DIA.creche))} creches</b> por ano. Esse valor não entra na soma acima.`],
});

const assembleias = group("Assembleias Legislativas",
  porEst.map(([uf, nome, , est]) => leaf(`${nome} (${uf})`, {
    sub: `${est} deputados ${uf === "DF" ? "distritais" : "estaduais"}`,
    people: est * (1 + REF.assessoresDepEstadual),
    cost: est * custoAnual.depEstadual,
    estimativa: true,
    unit: unidade.depEstadual(est, uf === "DF" ? "deputados distritais" : "deputados estaduais"),
  })),
  {
    sub: `1.059 deputados estaduais e distritais · ~${REF.assessoresDepEstadual} assessores cada (média estimada)`,
    unit: unidade.depEstadual(1059, "deputados estaduais"),
    note: "O número de assessores varia por assembleia (no ES, por exemplo, o limite é 19). O custo mostrado é um piso, só com o salário máximo. Os orçamentos reais são bem maiores: a Alesp (SP) custa R$ 1,46 bi por ano, a Alerj (RJ) R$ 1,27 bi e a da Bahia R$ 1,11 bi.",
  });

const governosEstaduais = group("Governos Estaduais", [
  leaf("Governadores e vices", {
    people: 54,
    unit: {
      title: "O topo de cada estado",
      head: { label: "1 governador", detail: "salário varia por estado", kind: "eleito" },
      staff: [{ n: 1, label: "1 vice-governador", kind: "eleito" }],
      times: 27, timesLabel: "estados + DF",
    },
    note: "Salários e número de secretarias variam por estado. Custo não estimado.",
  }),
  assembleias,
], { sub: "26 estados + Distrito Federal" });

const vereadoresMedia = Math.round(REF.vereadores / REF.municipios);
const municipios = leaf("Municípios", {
  sub: `${fmtInt.format(REF.municipios)} cidades · prefeitos, vices e vereadores`,
  people: REF.municipios * 2 + REF.vereadores,
  cost: REF.custoCamarasMunicipais,
  unit: {
    title: "Uma cidade, em média",
    head: { label: "1 prefeito", detail: "salário varia por cidade", kind: "eleito" },
    staff: [
      { n: 1, label: "1 vice-prefeito", kind: "eleito" },
      { n: vereadoresMedia, label: `~${vereadoresMedia} vereadores (mínimo de 9 por cidade)`, kind: "eleito" },
    ],
    unitCost: REF.custoCamarasMunicipais / REF.municipios, unitCostNote: "custo médio de uma câmara municipal, dado de 2018",
    times: REF.municipios, timesLabel: "cidades",
  },
  note: `São ${fmtInt.format(REF.vereadores)} vereadores empossados em 2025. O custo inclui toda a estrutura das câmaras (servidores, assessores, prédios) e vem do último levantamento nacional, de 2018. Hoje deve ser maior: só no estado de SP, cada vereador custou em média R$ 579,5 mil em 2024. Os assessores dos vereadores e das prefeituras não aparecem nos bonequinhos.`,
});

const brasil = group("Brasil", [executivoFederal, congresso, governosEstaduais, municipios], {
  sub: "Clique para abrir cada galho da árvore",
});

/* ---------- comparações do dia a dia ---------- */

function fmtDec(v) {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: v < 10 ? 1 : 0 });
}

let clipSeq = 0;
function stadium(fill) {
  const id = `clip${clipSeq++}`;
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 60");
  svg.setAttribute("class", "stadium");
  svg.setAttribute("aria-hidden", "true");
  const ring = "M2 30a48 28 0 1 0 96 0a48 28 0 1 0 -96 0zM22 30a28 14 0 1 1 56 0a28 14 0 1 1 -56 0z";
  svg.innerHTML =
    `<defs><clipPath id="${id}"><rect class="stadium-clip" x="0" y="0" width="${fill * 100}" height="60"/></clipPath></defs>` +
    `<path class="stadium-ring" d="${ring}" fill-rule="evenodd"/>` +
    `<path class="stadium-crowd" d="${ring}" fill-rule="evenodd" clip-path="url(#${id})"/>` +
    `<ellipse class="stadium-field" cx="50" cy="30" rx="26" ry="12"/>` +
    `<line class="stadium-line" x1="50" y1="18" x2="50" y2="42"/>`;
  return svg;
}

function emojiRow(emoji, count, max = 30) {
  const row = el("div", "emoji-row");
  row.setAttribute("aria-hidden", "true");
  const shown = Math.min(count, max);
  for (let i = 0; i < shown; i++) {
    const s = el("span", null, emoji);
    s.style.animationDelay = `${i * 30}ms`;
    row.append(s);
  }
  if (count > max) row.append(el("span", "more", `+${fmtInt.format(count - max)}`));
  return row;
}

function comparePeople(n) {
  const D = DIA_A_DIA;
  const onibus = () => {
    const k = Math.ceil(n / D.onibus);
    return { visual: emojiRow("🚌", k), big: fmtInt.format(k), text: `ônibus lotados, um atrás do outro (${D.onibus} lugares cada)` };
  };
  const aviao = () => {
    const k = Math.ceil(n / D.aviao);
    return { visual: emojiRow("✈️", k), big: fmtInt.format(k), text: `aviões Boeing 737 lotados (${D.aviao} lugares cada)` };
  };
  const maracana = () => {
    const f = n / D.maracana;
    const v = el("div", "stadiums");
    const full = Math.min(Math.floor(f), 3);
    for (let i = 0; i < full; i++) v.append(stadium(1));
    if (f < 3 && f % 1 > 0.05) v.append(stadium(f % 1));
    if (f >= 1) return { visual: v, big: fmtDec(f), text: `Maracanãs lotados, com ${fmtInt.format(D.maracana)} lugares cada` };
    return {
      visual: v, big: `${Math.round(f * 100)}%`,
      text: `do Maracanã ocupado${f >= 0.8 ? ", quase o estádio inteiro" : ""} (${fmtInt.format(D.maracana)} lugares)`,
    };
  };
  const cidade = () => {
    const pct = Math.round((n / D.cidade.pop) * 100);
    return {
      visual: emojiRow("🏘️", Math.min(10, Math.round(pct / 10)), 10),
      big: `${pct}%`,
      text: `da população inteira de ${D.cidade.nome}, uma cidade de ${fmtInt.format(D.cidade.pop)} habitantes`,
    };
  };
  if (n < D.aviao) return [onibus()];
  if (n < 20000) return [onibus(), aviao()];
  if (n < 80000) return [maracana(), onibus()];
  return [maracana(), cidade(), onibus()];
}

function compareMoney(v) {
  if (!v) return [];
  const D = DIA_A_DIA;
  const prof = Math.round(v / (D.pisoProfessor * 13));
  const out = [{
    visual: emojiRow("👩‍🏫", prof), big: fmtInt.format(prof),
    text: "professores recebendo o piso salarial durante um ano inteiro",
  }];
  if (v >= D.creche * 2) {
    const c = Math.floor(v / D.creche);
    out.push({ visual: emojiRow("🏫", c), big: fmtInt.format(c), text: "creches novas no padrão do governo federal (cerca de R$ 4,9 mi cada)" });
  } else {
    const c = Math.round(v / D.cestaBasica);
    out.push({ visual: emojiRow("🛒", c), big: fmtInt.format(c), text: "cestas básicas, ao preço de São Paulo" });
  }
  return out;
}

function renderCompare(people, cost, title) {
  const box = el("div", "compare");
  if (title) box.append(el("div", "compare-title", title));
  const grid = el("div", "compare-grid");
  [...comparePeople(people), ...compareMoney(cost)].forEach((c, i) => {
    const card = el("div", "cmp");
    card.style.transitionDelay = `${i * 120}ms`;
    card.append(c.visual, el("span", "cmp-big", c.big), el("span", "cmp-text", c.text));
    grid.append(card);
  });
  box.append(grid);
  return box;
}

/* ---------- bonequinhos ---------- */

const SVGNS = "http://www.w3.org/2000/svg";

function person(kind, big = false) {
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 32");
  svg.setAttribute("class", `person ${kind}${big ? " big" : ""}`);
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = big
    ? '<circle cx="12" cy="7" r="6"/><path d="M1 32v-8a9 9 0 0 1 9-9h4a9 9 0 0 1 9 9v8z"/><path class="tie" d="M12 16l-2 3 2 9 2-9z"/>'
    : '<circle cx="12" cy="7" r="6"/><path d="M1 32v-8a9 9 0 0 1 9-9h4a9 9 0 0 1 9 9v8z"/>';
  return svg;
}

function renderUnit(node) {
  const u = node.unit;
  const box = el("div", "unit");
  if (u.title) box.append(el("div", "unit-title", u.title));

  const org = el("div", "org");
  const head = el("div", "org-head");
  head.append(person(u.head.kind, true), el("span", "org-head-label", u.head.label), el("span", "org-head-detail", u.head.detail));
  org.append(head, el("div", "org-line"));

  const staffRow = el("div", "org-staff");
  let delay = 0;
  u.staff.forEach((s) => {
    const g = el("div", "staff-group");
    const icons = el("div", "icons");
    const count = Math.ceil(s.n / (s.per || 1));
    for (let i = 0; i < count; i++) {
      const p = person(s.kind);
      p.style.animationDelay = `${Math.min(delay++ * 25, 1200)}ms`;
      icons.append(p);
    }
    g.append(icons, el("div", "staff-label", s.label));
    if (s.per) g.append(el("div", "staff-scale", `cada bonequinho = ${s.per} pessoas`));
    staffRow.append(g);
  });
  org.append(staffRow);
  box.append(org);

  const perUnit = (u.head.n || 1) + u.staff.reduce((s, x) => s + x.n, 0);
  const sum = el("div", "unit-sum");
  sum.innerHTML = `<b>${fmtInt.format(perUnit)} pessoas</b>` +
    (u.unitCost ? ` · <b>${fmtMoney(u.unitCost)}/ano</b> <span>(${u.unitCostNote})</span>` : "");
  box.append(sum);

  if (u.times > 1) {
    const mult = el("div", "multiply");
    mult.append(el("span", "x", "×"), el("span", "times-n", fmtInt.format(u.times)), el("span", "times-l", u.timesLabel));
    const res = el("div", "result");
    const n = el("span", "result-n", "0");
    res.append(n, el("span", "result-l", "pessoas no total"));
    const extra = el("div", "result-extra");
    if (node.cost) {
      extra.innerHTML = `<b>${fmtMoney(node.cost)} por ano</b>, o mesmo que pagar <b>${fmtInt.format(Math.round(node.cost / (REF.salarioMinimo * 13)))}</b> trabalhadores com salário mínimo durante um ano.`;
    }
    box.append(el("div", "arrow", "↓"), mult, el("div", "arrow", "↓"), res, extra,
      renderCompare(node.people, node.cost, "Do tamanho de quê?"));
    const wait = reduceMotion() ? 0 : Math.min(delay * 25, 1200) + 300;
    box.classList.add("pending");
    setTimeout(() => {
      box.classList.remove("pending");
      animateNumber(n, node.people, (v) => fmtInt.format(Math.round(v)));
    }, wait);
  } else if (node.people >= DIA_A_DIA.aviao) {
    box.append(renderCompare(node.people, node.cost, "Do tamanho de quê?"));
  }
  return box;
}

/* ---------- renderização da árvore ---------- */

const revealed = new Set();
const leafPeople = new Map();

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function leavesOf(node) {
  return node.children ? node.children.flatMap(leavesOf) : [node];
}

function renderNode(node, depth = 0) {
  const wrap = el("div", `node depth-${Math.min(depth, 3)}`);
  const head = el("button", "node-head");
  head.type = "button";
  head.setAttribute("aria-expanded", "false");

  const titles = el("span", "titles");
  titles.append(el("span", "title", node.label));
  if (node.sub) titles.append(el("span", "sub", node.sub));

  const stats = el("span", "stats");
  stats.append(el("span", "stat-people", `${fmtInt.format(node.people)} pessoas`));
  const costTxt = node.cost ? fmtMoney(node.cost) + "/ano" : "custo não estimado";
  stats.append(el("span", "stat-cost", costTxt + (node.cost && (node.costPartial || node.estimativa) ? "*" : "")));

  head.append(el("span", "chev", "›"), titles, stats);
  wrap.append(head);

  const body = el("div", "node-body");
  body.hidden = true;
  wrap.append(body);

  let unitHost = null;
  let built = false;
  function build() {
    if (built) return;
    built = true;
    if (node.unit) { unitHost = el("div"); body.append(unitHost); }
    if (node.note) body.append(el("p", "note", node.note));
    (node.info || []).forEach((html) => {
      const p = el("p", "info");
      p.innerHTML = html;
      body.append(p);
    });
    if (node.children) {
      if (node.unit) body.append(el("h3", "children-title", "Por estado"));
      const list = el("div", "children");
      node.children.forEach((c) => list.append(renderNode(c, depth + 1)));
      body.append(list);
    }
    leavesOf(node).forEach((l) => leafPeople.set(l.id, l.people));
  }

  function setOpen(open) {
    if (open) build();
    body.hidden = !open;
    wrap.classList.toggle("open", open);
    head.setAttribute("aria-expanded", String(open));
    if (open && unitHost) {
      unitHost.replaceChildren(renderUnit(node));
      const before = revealed.size;
      leavesOf(node).forEach((l) => revealed.add(l.id));
      if (revealed.size !== before) updateRevealed();
    }
  }
  head.addEventListener("click", () => setOpen(body.hidden));
  wrap._setOpen = setOpen;
  return wrap;
}

/* ---------- contadores ---------- */

function animateNumber(elm, to, format) {
  const from = Number(elm.dataset.value || 0);
  elm.dataset.value = to;
  if (reduceMotion()) { elm.textContent = format(to); return; }
  const t0 = performance.now(), dur = 900;
  function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    elm.textContent = format(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateRevealed() {
  let n = 0;
  revealed.forEach((id) => (n += leafPeople.get(id) || 0));
  animateNumber(document.getElementById("revealed"), n, (v) => fmtInt.format(Math.round(v)));
  document.getElementById("revealed-bar").style.width = `${(n / brasil.people) * 100}%`;
}

/* ---------- seletor de estado ---------- */

function renderStatePicker() {
  const sel = document.getElementById("uf");
  ESTADOS.forEach(([uf, nome]) => {
    const o = el("option", null, nome);
    o.value = uf;
    sel.append(o);
  });
  const out = document.getElementById("uf-out");
  function show() {
    const s = ESTADOS.find((e) => e[0] === sel.value);
    out.innerHTML = "";
    if (!s) return;
    const [uf, nome, fed, est] = s;
    const assessoresFed = 3 * REF.assessoresSenador + fed * REF.assessoresDep;
    const custoCongresso = 3 * custoAnual.senador + fed * custoAnual.depFederal;
    const rows = [
      ["Senadores", 3, `até ${fmtInt.format(3 * REF.assessoresSenador)} cargos de confiança`],
      ["Deputados federais", fed, `até ${fmtInt.format(fed * REF.assessoresDep)} secretários parlamentares`],
      [uf === "DF" ? "Deputados distritais" : "Deputados estaduais", est, `~${fmtInt.format(est * REF.assessoresDepEstadual)} assessores (estimativa)`],
    ];
    rows.forEach(([t, n, s2]) => {
      const c = el("div", "uf-card");
      c.append(el("span", "uf-n", fmtInt.format(n)), el("span", "uf-t", t), el("span", "uf-s", s2));
      out.append(c);
    });
    const p = el("p", "uf-sum");
    p.innerHTML = `Só no Congresso, ${nome} tem <b>${fmtInt.format(3 + fed)}</b> parlamentares e até <b>${fmtInt.format(assessoresFed)}</b> assessores, com custo estimado de <b>${fmtMoney(custoCongresso)} por ano</b>. Isso equivale a <b>${fmtInt.format(Math.round(custoCongresso / (REF.salarioMinimo * 13)))}</b> trabalhadores recebendo salário mínimo durante um ano.`;
    out.append(p);
  }
  sel.addEventListener("change", show);
}

/* ---------- comparações ---------- */

function renderFacts() {
  const minimoAno = REF.salarioMinimo * 13;
  const facts = [
    [fmtInt.format(Math.round(custoAnual.depFederal / minimoAno)), "salários mínimos anuais pagam o custo de <b>um único deputado federal</b> por um ano."],
    [fmtInt.format(Math.round(REF.verbaGabineteDep / REF.salarioMinimo)), "salários mínimos cabem na verba de gabinete que <b>cada deputado</b> recebe por mês para contratar assessores."],
    [fmtInt.format(Math.round(REF.subsidioFederal / REF.salarioMinimo)), "salários mínimos é o que um deputado, senador ou ministro recebe <b>só de salário</b> por mês."],
    [fmtInt.format(81 * REF.assessoresSenador + 513 * REF.assessoresDep), "assessores podem ser contratados <b>só pelo Congresso</b>, no limite permitido, sem contar os servidores de carreira."],
  ];
  const box = document.getElementById("facts");
  facts.forEach(([n, html]) => {
    const f = el("div", "fact");
    f.append(el("span", "fact-n", n));
    const p = el("p");
    p.innerHTML = html;
    f.append(p);
    box.append(f);
  });
}

/* ---------- contador de visitas ---------- */

// Abacus: contador gratuito sem cadastro. Conta uma visita por sessão do navegador.
async function renderVisits() {
  const base = "https://abacus.jasoncameron.dev";
  const key = "wkliemann-mapa-do-poder/visitas";
  let counted = false;
  try { counted = sessionStorage.getItem("visitou") === "1"; } catch {}
  try {
    const res = await fetch(`${base}/${counted ? "get" : "hit"}/${key}`);
    if (!res.ok) return;
    const { value } = await res.json();
    if (typeof value !== "number" || value < 1) return;
    try { sessionStorage.setItem("visitou", "1"); } catch {}
    document.getElementById("visits").hidden = false;
    animateNumber(document.getElementById("visits-n"), value, (v) => fmtInt.format(Math.round(v)));
  } catch {
    // serviço fora do ar: o contador simplesmente não aparece
  }
}

/* ---------- init ---------- */

function init() {
  const tree = document.getElementById("tree");
  const root = renderNode(brasil);
  tree.append(root);
  root._setOpen(true);

  animateNumber(document.getElementById("total-people"), brasil.people, (v) => fmtInt.format(Math.round(v)));
  animateNumber(document.getElementById("total-cost"), brasil.cost, (v) => fmtMoney(v));
  document.getElementById("revealed-total").textContent = fmtInt.format(brasil.people);
  const hc = renderCompare(brasil.people, brasil.cost);
  document.getElementById("hero-compare").append(hc);
  requestAnimationFrame(() => requestAnimationFrame(() => hc.classList.add("in")));

  function walk(elm, fn) {
    fn(elm);
    elm.querySelectorAll(":scope > .node-body > .children > .node").forEach((c) => walk(c, fn));
  }
  document.getElementById("open-all").addEventListener("click", () => walk(root, (n) => n._setOpen(true)));
  document.getElementById("close-all").addEventListener("click", () => {
    root.querySelectorAll(".node").forEach((n) => n !== root && n._setOpen(false));
  });

  renderStatePicker();
  renderFacts();
  renderVisits();

  const src = document.getElementById("sources");
  FONTES.forEach(([t, u]) => {
    const li = el("li");
    const a = el("a", null, t);
    a.href = u; a.target = "_blank"; a.rel = "noopener";
    li.append(a);
    src.append(li);
  });
}

init();
