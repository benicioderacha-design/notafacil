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
