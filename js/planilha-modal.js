// js/planilha-modal.js
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("sheetModal");
  const iframe = document.getElementById("modalSheetIframe");
  if (!modalEl || !iframe) return;

  // Quando abrir o modal, pega o link do botão que clicou
  modalEl.addEventListener("show.bs.modal", (event) => {
    const btn = event.relatedTarget;
    const src = btn?.getAttribute("data-sheet-src");
    iframe.src = src || "";
  });

  // Quando fechar, limpa (evita travar/consumir memória)
  modalEl.addEventListener("hidden.bs.modal", () => {
    iframe.src = "";
  });
});
