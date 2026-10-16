window.onerror = (msg, src, linha) => alert("Erro: " + msg + " (linha " + linha + ")");
let timerNuvem;
const setItemOriginal = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (chave, valor) {
  setItemOriginal(chave, valor);
  clearTimeout(timerNuvem);
  timerNuvem = setTimeout(() => {
    if (window.salvarNaNuvem) window.salvarNaNuvem();
  }, 1000);
};
function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);
alert(Object.keys(localStorage).join(", "));
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
(function () {
  const CHAVE = "notafacil_estudo";
  let fim = null, tick = null, restante = 25 * 60, modo = "foco", pausado = true;

  const btn = document.createElement("button");
  btn.textContent = "⏱️";
  btn.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:9998;width:52px;height:52px;border:none;border-radius:50%;font-size:24px;background:var(--destaque,#38e0b5);box-shadow:0 4px 12px rgba(0,0,0,.4)";

  const painel = document.createElement("div");
  painel.style.cssText = "display:none;position:fixed;bottom:80px;right:16px;left:16px;max-width:360px;margin-left:auto;z-index:9998;padding:16px;border-radius:16px;background:var(--painel,#0d2038);color:var(--texto,#f0f6ff);border:1px solid var(--borda,#244565);box-shadow:0 8px 24px rgba(0,0,0,.5)";
  painel.innerHTML =
    '<h3 style="margin:0 0 8px">⏱️ Timer de estudo</h3>' +
    '<select id="est-materia" style="width:100%;padding:8px;margin-bottom:8px"></select>' +
    '<div id="est-tempo" style="font-size:44px;font-weight:bold;text-align:center">25:00</div>' +
    '<div id="est-modo" style="text-align:center;margin-bottom:8px">Foco</div>' +
    '<div style="display:flex;gap:8px">' +
    '<button id="est-iniciar" style="flex:1;padding:10px;border:none;border-radius:8px;background:var(--destaque,#38e0b5);font-weight:bold">Iniciar</button>' +
    '<button id="est-reset" style="padding:10px;border:none;border-radius:8px">Zerar</button></div>' +
    '<div id="est-hoje" style="margin-top:10px;font-size:14px;opacity:.8"></div>';
  document.body.append(btn, painel);

  const $ = (id) => document.getElementById(id);
  const hojeStr = () => new Date().toLocaleDateString("sv-SE");

  function lerLog() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) { return []; }
  }

  function carregarMaterias() {
    const sel = $("est-materia");
    sel.innerHTML = '<option value="Geral">Geral</option>';
    try {
      const lista = JSON.parse(localStorage.getItem("notafacil_materias")) || [];
      (Array.isArray(lista) ? lista : []).forEach((m) => {
        const nome = typeof m === "string" ? m : (m.nome || m.name || m.materia || m.titulo || "");
        if (nome) sel.innerHTML += '<option value="' + nome + '">' + nome + "</option>";
      });
    } catch (e) {}
  }

  function render() {
    const m = String(Math.floor(restante / 60)).padStart(2, "0");
    const s = String(restante % 60).padStart(2, "0");
    $("est-tempo").textContent = m + ":" + s;
    $("est-modo").textContent = modo === "foco" ? "Foco" : "Pausa";
    $("est-iniciar").textContent = pausado ? (restante === (modo === "foco" ? 1500 : 300) ? "Iniciar" : "Continuar") : "Pausar";
    const total = lerLog().filter((l) => l.data === hojeStr()).reduce((a, l) => a + l.minutos, 0);
    $("est-hoje").textContent = "Estudado hoje: " + total + " min";
  }

  function registrar(min) {
    const log = lerLog();
    log.push({ data: hojeStr(), materia: $("est-materia").value, minutos: min });
    localStorage.setItem(CHAVE, JSON.stringify(log));
    if (window.salvarNaNuvem) window.salvarNaNuvem();
  }

  function terminar() {
    clearInterval(tick);
    pausado = true;
    if (modo === "foco") { registrar(25); modo = "pausa"; restante = 5 * 60; }
    else { modo = "foco"; restante = 25 * 60; }
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    render();
    alert(modo === "pausa" ? "Foco concluído! Hora da pausa." : "Pausa acabou! Bora estudar.");
  }

  function atualizar() {
    restante = Math.ceil((fim - Date.now()) / 1000);
    if (restante <= 0) { restante = 0; terminar(); } else render();
  }

  $("est-iniciar").onclick = () => {
    if (pausado) {
      fim = Date.now() + restante * 1000;
      tick = setInterval(atualizar, 500);
      pausado = false;
    } else {
      restante = Math.max(0, Math.round((fim - Date.now()) / 1000));
      clearInterval(tick);
      pausado = true;
    }
    render();
  };

  $("est-reset").onclick = () => {
    clearInterval(tick);
    pausado = true; modo = "foco"; restante = 25 * 60;
    render();
  };

  btn.onclick = () => {
    const aberto = painel.style.display === "block";
    painel.style.display = aberto ? "none" : "block";
    if (!aberto) { carregarMaterias(); render(); }
  };

  render();
})();
