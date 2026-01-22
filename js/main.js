// js/main.js
(function () {
  const $ = (id) => document.getElementById(id);

  // Data e hora (pt-BR)
  const agora = new Date();
  const dataFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(agora);
  const horaFmt = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(agora);

  if ($("dataAtual")) $("dataAtual").textContent = dataFmt;
  if ($("horaAtual")) $("horaAtual").textContent = horaFmt;
  if ($("ano")) $("ano").textContent = String(agora.getFullYear());

})();
