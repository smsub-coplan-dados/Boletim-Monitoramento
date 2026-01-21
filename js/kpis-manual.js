// js/kpis-manual.js
// Atualização manual do boletim (edite somente aqui)

const KPIS_DO_DIA = {
  estoqueTotal: 11246,
  // estoqueAtual: 15420,
  abertas: 3825,
  encerradas: 7115,
  topCumprida: "Parelheiros, Perus, Guaianazes (cumpriu a meta)",
  faltaMuito: "Pirituba, Cidade Ademar (muito abaixo da meta)",
};


// ====== Render no HTML ======
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatBR(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("pt-BR") : String(n ?? "—");
}

document.addEventListener("DOMContentLoaded", () => {
  setText("kpiEstoqueTotal", formatBR(KPIS_DO_DIA.estoqueTotal));
  // setText("kpiEstoqueAtual", formatBR(KPIS_DO_DIA.estoqueAtual));
  setText("kpiAbertas", formatBR(KPIS_DO_DIA.abertas));
  setText("kpiEncerradas", formatBR(KPIS_DO_DIA.encerradas));
  setText("kpiTopCumprida", KPIS_DO_DIA.topCumprida || "—");
  setText("kpiFaltaMuito", KPIS_DO_DIA.faltaMuito || "—");

});
