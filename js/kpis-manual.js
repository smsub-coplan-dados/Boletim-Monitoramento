// js/kpis-manual.js
// Atualização manual do boletim (edite somente aqui)

const KPIS_DO_DIA = {
  estoqueTotal: 11382,
  abertas: 3866,
  encerradas: 7115,
  topCumprida: "Vila Mariana: 16806, Pinheiros: 16518, Butantã: 14699",
  faltaMuito: "Perus: 2297, Cidade Tiradentes: 1617, Parelheiros: 1497",
};

// =====================
// Parsers
// =====================

// Ex: "Vila Mariana (16806)" -> { nome: "Vila Mariana", valor: 16806 }
function parseRegioesComValor(texto) {
  return (texto || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      const m = item.match(/^(.+?)\s*\(([\d.]+)\)\s*$/); // pega número entre parênteses
      if (!m) return { nome: item, valor: null };

      const nome = m[1].trim();
      const valor = Number(m[2].replace(/\./g, "")); // se vier "16.806"
      return { nome, valor: Number.isFinite(valor) ? valor : null };
    });
}

// Ex: "Perus, Cidade Tiradentes" -> [{nome:"Perus"},{nome:"Cidade Tiradentes"}]
function parseRegioesSemValor(texto) {
  return (texto || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(nome => ({ nome, valor: null }));
}

function formatBR(n) {
  return Number(n).toLocaleString("pt-BR");
}

// =====================
// Render
// =====================

function renderCards(containerId, items, badgeLabel) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";

  items.forEach((it) => {
    const col = document.createElement("div");
    col.className = "col-12"; // um embaixo do outro (muda p/ col-md-4 se quiser 3 por linha no PC)

    col.innerHTML = `
      <div class="reg-card">
        <div class="reg-card__row">
          <div class="reg-card__name">${it.nome}</div>
          ${it.valor !== null ? `<div class="reg-card__value">${formatBR(it.valor)}</div>` : ""}
        </div>
        ${badgeLabel ? `<div class="reg-card__badge">${badgeLabel}</div>` : ""}
      </div>
    `;

    el.appendChild(col);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const top = parseRegioesComValor(KPIS_DO_DIA.topCumprida);
  const falta = parseRegioesSemValor(KPIS_DO_DIA.faltaMuito);

  renderCards("cardsTopCumprida", top, );
  renderCards("cardsFaltaMuito", falta, );
});


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
