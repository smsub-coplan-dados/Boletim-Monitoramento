// js/planilha-modal.js

document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("sheetModal");
  const modalIframe = document.getElementById("modalSheetIframe");

  if (!modalEl || !modalIframe) return;

  modalEl.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget; // botão que abriu o modal
    const src = trigger?.getAttribute("data-sheet-src");

    if (src) modalIframe.src = src;
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    // limpa pra não ficar rodando em background
    modalIframe.src = "";
  });
});
