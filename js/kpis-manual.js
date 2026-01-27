// js/kpis-manual.js

const KPIS_DO_DIA = {
  estoqueTotal: 9406,
  abertas: 4949,
  encerradas: 9670,

  topCumprida: "Vila Mariana (16812), Pinheiros (16553), Butantã (14772)",
  faltaMuito: "Perus (2303), Cidade Tiradentes (1617), Parelheiros (1497)",

  // Sua lista: "Nome (n), Nome (n)..."
  menorExecServico:
    "Poda e Remoção - Manejo Árvore (77775), Poda e Remoção de Árvores (43259), Poda Árvore ENEL (13936), Remoção Árvore ENEL (9050), Poda Remoção Árvores ENEL (2309)",
};

// ==============================
// Explicações minimalistas (1 linha)
// ==============================
const SERVICO_EXPLICACAO = {
  "Poda e Remoção - Manejo Árvore": "Serviço recorrente e amplo (alta incidência no município).",
  "Poda e Remoção de Árvores": "Demanda geral do programa (alto volume por cobertura territorial).",
  "Poda Árvore ENEL": "Atendimento condicionado à rede elétrica (priorização e dependências externas).",
  "Remoção Árvore ENEL": "Casos críticos/risco + dependência de interface com concessionária.",
  "Poda Remoção Árvores ENEL": "Categoria mais específica (menor base), por isso volume menor.",
};

function explicacaoServico(nome) {
  if (SERVICO_EXPLICACAO[nome]) return SERVICO_EXPLICACAO[nome];

  const n = (nome || "").toUpperCase();
  if (n.includes("ENEL")) return "Demanda ligada à rede elétrica (priorização e dependências externas).";
  if (n.includes("REMO")) return "Atendimento mais complexo (risco e maior esforço operacional).";
  if (n.includes("MANEJO")) return "Atendimento recorrente (rotina operacional contínua).";
  if (n.includes("PODA")) return "Demanda frequente (manutenção preventiva/corretiva).";

  return "Volume relacionado à recorrência e abrangência do serviço no período.";
}

// ===== Helpers =====
function formatBR(n) {
  return Number(n).toLocaleString("pt-BR");
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseRanking(input) {
  if (Array.isArray(input)) return input;
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
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

  el.innerHTML = lista
    .map((r, idx) => {
      const v = r.valor == null || Number.isNaN(r.valor) ? "—" : formatBR(r.valor);
      const pos = idx + 1;

      return `
        <div class="reg-card">
          <div class="reg-card__row">
            <div class="reg-card__name">${pos}. ${escapeHTML(r.nome)}</div>
            <div class="reg-card__value">${escapeHTML(v)}</div>
          </div>
          <div class="reg-card__badge">${escapeHTML(badgeText)}</div>
        </div>
      `;
    })
    .join("");
}

// ===== Pizza de serviços =====
let pieInstance = null;

function updateServicoSelecionado(nome, valor, total) {
  const t = document.getElementById("servicoSelecionadoTitulo");
  const v = document.getElementById("servicoSelecionadoValor");
  const p = document.getElementById("servicoSelecionadoPct");
  const expEl = document.getElementById("servicoSelecionadoExp"); // (HTML precisa ter esse id)

  if (t) t.textContent = nome ? nome : "Serviço selecionado";
  if (v) v.textContent = valor == null ? "—" : formatBR(valor);

  const pct = total && valor != null ? (valor / total) * 100 : null;
  if (p) p.textContent = pct == null ? "—" : `${pct.toFixed(1)}% do total`;

  if (expEl) expEl.textContent = nome ? explicacaoServico(nome) : "—";
}

function renderServicosPie(canvasId, rankingString) {
  if (!window.Chart) {
    console.error("Chart.js NÃO carregou. Verifique o <script> do CDN.");
    return;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas #${canvasId} não encontrado no HTML.`);
    return;
  }

  const lista = parseRanking(rankingString).filter((x) => x.valor != null && !Number.isNaN(x.valor));
  if (!lista.length) {
    console.error("Lista de serviços vazia/sem números.");
    return;
  }

  // Ordem desc
  lista.sort((a, b) => b.valor - a.valor);

  const labels = lista.map((x) => x.nome);
  const values = lista.map((x) => x.valor);
  const total = values.reduce((acc, n) => acc + n, 0);

  if (pieInstance) pieInstance.destroy();

  pieInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          borderWidth: 1,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed;
              const pct = total ? (v / total) * 100 : 0;
              const nome = ctx.label;
              const exp = explicacaoServico(nome);

              // Duas linhas no tooltip
              return [
                ` ${formatBR(v)} (${pct.toFixed(1)}%)`,
                ` ${exp}`,
              ];
            },
          },
        },
      },
      onClick: (evt) => {
        const points = pieInstance.getElementsAtEventForMode(evt, "nearest", { intersect: true }, true);
        if (!points.length) return;

        const i = points[0].index;
        updateServicoSelecionado(labels[i], values[i], total);
      },
    },
  });

  // Default: primeiro item
  updateServicoSelecionado(labels[0], values[0], total);
}

// ===== Init =====
function applyKPIs() {
  const $ = (id) => document.getElementById(id);

  if ($("kpiEstoqueTotal")) $("kpiEstoqueTotal").textContent = formatBR(KPIS_DO_DIA.estoqueTotal);
  if ($("kpiAbertas")) $("kpiAbertas").textContent = formatBR(KPIS_DO_DIA.abertas);
  if ($("kpiEncerradas")) $("kpiEncerradas").textContent = formatBR(KPIS_DO_DIA.encerradas);

  renderRankingCards("cardsTopCumprida", KPIS_DO_DIA.topCumprida, "Maior execução no período");
  renderRankingCards("cardsFaltaMuito", KPIS_DO_DIA.faltaMuito, "Menor execução no período");

  renderServicosPie("servicosPie", KPIS_DO_DIA.menorExecServico);
}

document.addEventListener("DOMContentLoaded", applyKPIs);
