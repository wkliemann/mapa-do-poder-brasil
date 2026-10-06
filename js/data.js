// Dados do Mapa do Poder. Valores de referência de 2025/2026.
// Campo "estimativa: true" marca números que variam e foram aproximados.

const REF = {
  salarioMinimo: 1621.0,          // 2026
  subsidioFederal: 46366.19,      // dep. federal, senador, presidente, ministros (desde fev/2025)
  subsidioEstadual: 34774.64,     // teto do dep. estadual = 75% do federal
  verbaGabineteDep: 165806.07,    // por deputado federal / mês (fev/2026)
  ceapMedia: 44000,               // cota parlamentar: R$ 36.582 (DF) a R$ 51.406 (RR)
  auxilioMoradia: 4253,
  senadorCustoMes: 596000,        // custo total estimado por senador/mês
  assessoresDep: 25,
  assessoresSenador: 55,
  assessoresDepEstadual: 20,      // estimativa média; varia por assembleia
  ministros: 38,
  comissionadosFederais: 50770,   // nov/2025
  municipios: 5569,
  vereadores: 58072,
  custoCamarasMunicipais: 16.44e9, // último consolidado nacional (2018)
  emendas2026: 61.4e9,
};

// Referências do dia a dia usadas nas comparações
const DIA_A_DIA = {
  onibus: 44,                 // ônibus rodoviário comum
  aviao: 186,                 // Boeing 737-800
  maracana: 78838,            // capacidade oficial
  cidade: { nome: "Teresópolis (RJ)", pop: 165123 }, // Censo 2022
  pisoProfessor: 5130.63,     // piso nacional 2026, 40h
  cestaBasica: 900.59,        // DIEESE, São Paulo, ago/2026
  creche: 4.94e6,             // creche padrão FNDE tipo 1 (jan/2025)
};

// [UF, nome, deputados federais, deputados estaduais]
const ESTADOS = [
  ["AC", "Acre", 8, 24], ["AL", "Alagoas", 9, 27], ["AP", "Amapá", 8, 24],
  ["AM", "Amazonas", 8, 24], ["BA", "Bahia", 39, 63], ["CE", "Ceará", 22, 46],
  ["DF", "Distrito Federal", 8, 24], ["ES", "Espírito Santo", 10, 30],
  ["GO", "Goiás", 17, 41], ["MA", "Maranhão", 18, 42], ["MT", "Mato Grosso", 8, 24],
  ["MS", "Mato Grosso do Sul", 8, 24], ["MG", "Minas Gerais", 53, 77],
  ["PA", "Pará", 17, 41], ["PB", "Paraíba", 12, 36], ["PR", "Paraná", 30, 54],
  ["PE", "Pernambuco", 25, 49], ["PI", "Piauí", 10, 30], ["RJ", "Rio de Janeiro", 46, 70],
  ["RN", "Rio Grande do Norte", 8, 24], ["RS", "Rio Grande do Sul", 31, 55],
  ["RO", "Rondônia", 8, 24], ["RR", "Roraima", 8, 24], ["SC", "Santa Catarina", 16, 40],
  ["SP", "São Paulo", 70, 94], ["SE", "Sergipe", 8, 24], ["TO", "Tocantins", 8, 24],
];

const custoAnual = {
  agentePolitico: REF.subsidioFederal * 13,
  depFederal:
    REF.subsidioFederal * 13 +
    (REF.verbaGabineteDep + REF.ceapMedia + REF.auxilioMoradia) * 12,
  senador: REF.senadorCustoMes * 12,
  depEstadual: REF.subsidioEstadual * 13,
};

const FONTES = [
  ["Câmara dos Deputados: verbas e recursos do deputado", "https://www.camara.leg.br/transparencia/gastos-parlamentares"],
  ["Diário do Nordeste: salários e benefícios de deputados e senadores", "https://diariodonordeste.verdesmares.com.br/pontopoder/entenda-a-estrutura-salarial-e-de-beneficios-de-deputados-e-senadores-no-brasil-1.3757378"],
  ["Gazeta do Povo: quanto custa um senador", "https://www.gazetadopovo.com.br/vozes/lucio-vaz/milhares-de-assessores-salarios-gordos-plano-de-saude-quanto-custa-um-senador-no-brasil/"],
  ["Congresso em Foco: limite de cargos nos gabinetes do Senado", "https://www.congressoemfoco.com.br/noticia/56803/senadores-violam-regra-e-montam-supergabinetes"],
  ["Revista Oeste: 50.770 cargos comissionados no governo federal", "https://www.revistaoeste.com/politica/governo-lula-totaliza-mais-de-50-mil-cargos-comissionados-em-2025/"],
  ["Lei 14.204/2021: cargos e funções de confiança do Executivo federal", "https://www2.camara.leg.br/legin/fed/lei/2021/lei-14204-16-setembro-2021-791739-publicacaooriginal-163432-pl.html"],
  ["Poder360: 5.569 cidades e cerca de 58 mil vereadores", "https://www.poder360.com.br/eleicoes/5-569-cidades-elegem-prefeitos-e-cerca-de-58-114-vereadores-em-2024/"],
  ["Câmara: veto ao aumento de 513 para 531 deputados", "https://www.camara.leg.br/noticias/1181279-LULA-VETA-PROJETO-QUE-AUMENTA-DE-513-PARA-531-O-NUMERO-DE-DEPUTADOS-FEDERAIS"],
  ["Itatiaia: cota parlamentar por estado", "https://www.itatiaia.com.br/politica/saiba-quanto-cada-deputado-federal-pode-gastar-com-a-cota-parlamentar/"],
  ["A Gazeta: assessores de deputados estaduais (ES)", "https://www.agazeta.com.br/es/politica/quanto-custa-cada-deputado-estadual-do-es-veja-salario-e-beneficios-0922"],
  ["Revista Pesquisa FAPESP: o custo do Legislativo brasileiro", "https://revistapesquisa.fapesp.br/o-custo-elevado-do-legislativo-brasileiro/"],
  ["TCE-SP: custo médio de um vereador paulista em 2024", "https://tce.sp.gov.br/6524-2024-custo-medio-cada-vereador-paulista-foi-r-5795-mil"],
  ["Brasil de Fato: Orçamento 2026 com R$ 61,4 bi em emendas", "https://www.brasildefato.com.br/2025/12/19/no-ultimo-dia-de-trabalho-congresso-aprova-orcamento-de-2026-com-r-614-bi-em-emendas-e-previsao-de-superavit-de-r-345-bi/"],
  ["Portal Tela: Maracanã com 78.838 lugares", "https://www.portaltela.com/esporte/futebol/2026/04/21/estadio-do-rio-78-838-lugares-vira-templo-do-futebol-mundial-e-palco-de-finais/"],
  ["IBGE Cidades: Teresópolis, Censo 2022", "https://www.ibge.gov.br/cidades-e-estados/rj/teresopolis.html"],
  ["Piso dos professores 2026: R$ 5.130,63", "https://portaldeprefeitura.com.br/curiosidades/piso-dos-professores-mec-assina-portaria-com-novo-reajuste/614079/"],
  ["DIEESE: cesta básica agosto/2026", "https://www.dieese.org.br/analisecestabasica/2026/202608cestabasica.pdf"],
  ["FNDE: planilha padrão da creche Proinfância tipo 1", "https://alertalicitacao.com.br/!licitacao/DOU-bc9b7687b820d5d40c7d"],
  ["Band: salário mínimo de R$ 1.621 em 2026", "https://www.band.com.br/band-vale/noticias/salario-minimo-sobe-para-r-1621-a-partir-de-janeiro-de-2026-202512250915"],
];
