// ========= Helpers =========
function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setPill(id, text, variant /* "ok" | "warn" | "danger" */) {
  const el = $(id);
  if (!el) return;

  el.textContent = text;

  // remove classes antigas
  el.classList.remove("pill-ok", "pill-warn", "pill-danger");

  // aplica nova
  if (variant === "ok") el.classList.add("pill-ok");
  else if (variant === "danger") el.classList.add("pill-danger");
  else el.classList.add("pill-warn");
}

function formatBR(n) {
  return Number(n).toLocaleString("pt-BR");
}

// ========= Data/hora =========
const agora = new Date();

if ($("dataAtual")) {
  $("dataAtual").textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(agora);
}
if ($("horaAtual")) {
  $("horaAtual").textContent = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(agora);
}
if ($("ano")) {
  $("ano").textContent = agora.getFullYear();
}

// ========= ENTRADAS (ATUALIZE AQUI) =========
// Base fixa (estoque inicial do período)
const baseInicial = 17669;

// Estoque atual (HOJE)
const estoqueHoje = 8645;

// Estoque do dia anterior (ONTEM)
const estoqueOntem = 9665;

// ========= CÁLCULOS =========
const faltaParaZerar = Math.max(0, estoqueHoje);
const concluidasAcumuladas = Math.max(0, baseInicial - estoqueHoje);

const pctConcluido = baseInicial === 0
  ? 0
  : Number(((concluidasAcumuladas / baseInicial) * 100).toFixed(1));

// Ritmo do dia: positivo = reduziu; negativo = aumentou
const variacaoDia = estoqueHoje - estoqueOntem;         // >0 piorou (subiu), <0 melhorou (caiu)
const reducaoDia = Math.max(0, estoqueOntem - estoqueHoje); // quanto reduziu hoje (se reduziu)

// Tendência textual
const tendencia =
  variacaoDia > 0 ? "subiu" :
  variacaoDia === 0 ? "estagnou" :
  "caiu";

// Projeção simples (bem “de acompanhamento”): se hoje reduziu X, estima dias p/ zerar
// Se não reduziu hoje, projeção vira "—" (não dá pra estimar com ritmo zero/negativo)
const diasEstimados = reducaoDia > 0 ? Math.ceil(faltaParaZerar / reducaoDia) : null;

// ========= RISCO (por pressão relativa ao base) =========
// Você pode ajustar os cortes. Aqui está “inteligente” e proporcional ao cenário.
const ratio = baseInicial === 0 ? 0 : estoqueHoje / baseInicial;

let riscoTxt, riscoClass;
if (ratio >= 0.70) { riscoTxt = "ALTO"; riscoClass = "danger"; }
else if (ratio >= 0.40) { riscoTxt = "MÉDIO"; riscoClass = "warn"; }
else { riscoTxt = "BAIXO"; riscoClass = "ok"; }

// ========= ANDAMENTO (Bom/Ruim) =========
// Regra direta e útil no dia a dia:
// - "BOM" se hoje reduziu (reducaoDia > 0)
// - "RUIM" se estagnou ou aumentou
const andamentoBom = reducaoDia > 0;

const andamentoTxt = andamentoBom ? "BOM" : "RUIM";

// ========= ATUALIZA KPIs =========
// Card 1 — Estoque Atual
setText("kpiEstoqueAtual", formatBR(estoqueHoje));

// Rodapé do card 1: variação vs ontem (com seta + número)
const varStr =
  variacaoDia < 0 ? `↓ ${formatBR(Math.abs(variacaoDia))}` :
  variacaoDia > 0 ? `↑ ${formatBR(variacaoDia)}` :
  "— 0";

setText("kpiEstoqueVar", varStr);

// Card 2 — Andamento (Bom/Ruim + contexto útil)
setText("kpiAndamento", andamentoTxt);
setPill("kpiRisco", riscoTxt, riscoClass);

// ========= STATUS DO TOPO (OK / Atenção) =========
// Ele existe no seu HTML: Status: <span class="badge ...">OK</span>
(function updateTopStatus() {
  const badge = document.querySelector(".badge-pill .badge");
  if (!badge) return;

  // OK só se reduziu hoje e o risco não é ALTO
  const ok = andamentoBom && riscoTxt !== "ALTO";

  badge.textContent = ok ? "OK" : "Atenção";
  badge.classList.remove("text-bg-success", "text-bg-warning", "text-bg-danger");
  badge.classList.add(ok ? "text-bg-success" : "text-bg-warning");
})();

// ========= ALERTA DO DIA + DESTAQUE (dinâmicos e acompanháveis) =========
let alertaTexto = "";
let destaqueTexto = "";

// ALERTA: fala do risco + tendência + “o que fazer”
if (tendencia === "subiu") {
  alertaTexto = "Backlog aumentou hoje. Priorize triagem e ataque itens críticos para inverter a tendência.";
} else if (tendencia === "estagnou") {
  alertaTexto = "Hoje não houve redução. Procure o gargalo (fila, time, validação) e destrave o fluxo.";
} else {
  // caiu
  if (riscoTxt === "ALTO") {
    alertaTexto = "Houve redução, mas ainda existe alta pressão operacional. Mantenha foco e cadência.";
  } else if (riscoTxt === "MÉDIO") {
    alertaTexto = "Redução em andamento. Segure o ritmo para não perder tração.";
  } else {
    alertaTexto = "Cenário controlado: redução consistente e risco baixo no momento.";
  }
}

// DESTAQUE: traz “métrica humana” sem ficar repetindo o KPI principal
// (aqui entra projeção e % concluído, que dá sensação de progresso real)
if (andamentoBom) {
  const proj = diasEstimados ? `Se repetir o ritmo de hoje, zera em ~${diasEstimados} dia(s).` : "";
  destaqueTexto = `Progresso acumulado: ${pctConcluido}% concluído. ${proj}`.trim();
} else {
  // ruim: reforça ação prática
  const motivo = tendencia === "subiu" ? "entrada maior que saída" : "ritmo travado";
  destaqueTexto = `Dia ruim (${motivo}). Sugestão: definir 1 prioridade do dia e medir saída mínima até o fim do expediente.`;
}

document.addEventListener("DOMContentLoaded", () => {
  const agora = new Date();

  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const horaFormatada = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Topo
  const dataEl = document.getElementById("dataAtual");
  const horaEl = document.getElementById("horaAtual");

  if (dataEl) dataEl.textContent = dataFormatada;
  if (horaEl) horaEl.textContent = horaFormatada;

  // Todos os subtítulos
  document.querySelectorAll(".atualizacao-diaria").forEach(el => {
    el.textContent = `Atualizado em ${dataFormatada} às ${horaFormatada}`;
  });

  // Rodapé
  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = agora.getFullYear();
});

// Empurra um “checkpoint” objetivo: falta quanto pra zerar
// (isso é o que faz a pessoa acompanhar sem precisar decorar base)
destaqueTexto += ` Faltam ${formatBR(faltaParaZerar)} para zerar.`;

setText("cardAlerta", alertaTexto);
setText("cardDestaque", destaqueTexto);

// ========= (Opcional) Trocar pill "Atenção/Bom" nos cards laterais =========
// Se você quiser que as pills "Atenção" e "Bom" mudem sozinhas, me diga quais classes/IDs você usa nelas.
// Hoje elas estão hardcoded no HTML, sem id.
