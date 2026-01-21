function renderAba(workbook, sheetName, tableId) {
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const table = document.getElementById(tableId);
  if (!table) return;

  table.innerHTML = "";

  json.forEach((row, i) => {
    const tr = document.createElement("tr");

    row.forEach((cell) => {
      const td = document.createElement(i === 0 ? "th" : "td");
      td.textContent = cell ?? "";
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });
}

function renderTabs(workbook, tabsId, tableId) {
  const tabsEl = document.getElementById(tabsId);
  if (!tabsEl) return;

  tabsEl.innerHTML = "";

  workbook.SheetNames.forEach((name, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline-dark me-2 mb-2";
    btn.textContent = name;

    btn.addEventListener("click", () => {
      renderAba(workbook, name, tableId);
    });

    tabsEl.appendChild(btn);

    if (idx === 0) renderAba(workbook, name, tableId);
  });
}

async function carregarExcel(src, tabsId, tableId) {
  const res = await fetch(src);
  const arrayBuffer = await res.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const workbook = XLSX.read(data, { type: "array" });

  renderTabs(workbook, tabsId, tableId);
}

document.addEventListener("DOMContentLoaded", () => {
  // inline viewer (dentro da página)
  carregarExcel("dados\Estoque Poda e Remocao por Sub 21-01-26.xlsx", "excelTabsInline", "excelTableInline");

  // modal viewer (ampliar)
  const modal = document.getElementById("sheetModal");
  if (modal) {
    modal.addEventListener("shown.bs.modal", (ev) => {
      const btn = document.querySelector('[data-bs-target="#sheetModal"]');
      const src = btn?.getAttribute("data-excel-src") || "dados\Estoque Poda e Remocao por Sub 21-01-26.xlsx";

      carregarExcel(src, "excelTabsModal", "excelTableModal");
    });
  }
});
