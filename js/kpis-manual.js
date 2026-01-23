// js/kpis-manual.js

const KPIS_DO_DIA = {
  estoqueTotal: 10520,
  abertas: 4355,
  encerradas: 8224,

  // Aceita string "Nome (123), Nome (456)"
  topCumprida: "Vila Mariana (16810), Pinheiros (16531), Butantã (14728)",

  faltaMuito: "Perus (2300), Cidade Tiradentes (1617), Parelheiros (1497)"
};

// ===== Helpers =====
function formatBR(n) {
  return Number(n).toLocaleString("pt-BR");
}

function parseRanking(input) {
  // Se já vier array [{nome, valor}]
  if (Array.isArray(input)) return input;

  // Se vier string com padrões "Nome (123)"
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      // captura nome + número dentro de parênteses
      const m = item.match(/^(.*?)(?:\s*\(\s*([0-9]+)\s*\))?$/);
      const nome = (m?.[1] || item).trim();
      const valor = m?.[2] ? Number(m[2]) : null;
      return { nome, valor };
    });
}

function renderRankingCards(containerId, ranking, badgeText) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const lista = parseRanking(ranking);

  if (!lista.length) {
    el.textContent = "—";
    return;
  }

  el.innerHTML = lista.map((r, idx) => {
    const v = (r.valor === null || Number.isNaN(r.valor)) ? "—" : formatBR(r.valor);
    const pos = idx + 1;

    return `
      <div class="reg-card">
        <div class="reg-card__row">
          <div class="reg-card__name">${pos}. ${r.nome}</div>
          <div class="reg-card__value">${v}</div>
        </div>
        <div class="reg-card__badge">${badgeText}</div>
      </div>
    `;
  }).join("");
}

(function applyKPIs() {
  const $ = (id) => document.getElementById(id);

  if ($("kpiEstoqueTotal")) $("kpiEstoqueTotal").textContent = formatBR(KPIS_DO_DIA.estoqueTotal);
  if ($("kpiAbertas")) $("kpiAbertas").textContent = formatBR(KPIS_DO_DIA.abertas);
  if ($("kpiEncerradas")) $("kpiEncerradas").textContent = formatBR(KPIS_DO_DIA.encerradas);

  renderRankingCards(
    "cardsTopCumprida",
    KPIS_DO_DIA.topCumprida,
    "Maior execução no período"
  );

  renderRankingCards(
    "cardsFaltaMuito",
    KPIS_DO_DIA.faltaMuito,
    "Menor execução no período"
  );
})();
