// js/planilha-modal.js
(function () {
  const modalEl = document.getElementById("sheetModal");
  const iframe = document.getElementById("modalSheetIframe");

  if (!modalEl || !iframe) return;

  modalEl.addEventListener("show.bs.modal", (event) => {
    const btn = event.relatedTarget;
    const src = btn?.getAttribute("data-sheet-src");
    iframe.src = src || "";
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    // limpa pra não ficar consumindo memória/rede
    iframe.src = "";
  });
})();
