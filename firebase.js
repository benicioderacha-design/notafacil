import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAwb4eVX2rl1wZGTnTTNoI0EKDU_VUXdM",
  authDomain: "notafacil-ed4a9.firebaseapp.com",
  projectId: "notafacil-ed4a9",
  storageBucket: "notafacil-ed4a9.firebasestorage.app",
  messagingSenderId: "637272158548",
  appId: "1:637272158548:web:5a46426f16bfad2f0818c1",
  measurementId: "G-0EB2PEP31Q"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase inicializado!");
console.log("Projeto:", app.options.projectId);

// Lê tudo que o app guarda no aparelho
window.obterDadosNotaFacil = function () {
  const dados = {};
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith("firebase:")) continue;
    dados[chave] = localStorage.getItem(chave);
  }
  return { dados };
};

// Aplica no aparelho os dados que vieram da nuvem
window.aplicarDadosNotaFacil = function (nuvem) {
  if (!nuvem || !nuvem.dados) {
    if (window.salvarNaNuvem) window.salvarNaNuvem();
    return;
  }
  let mudou = false;
  for (const chave in nuvem.dados) {
    if (localStorage.getItem(chave) !== nuvem.dados[chave]) {
      localStorage.setItem(chave, nuvem.dados[chave]);
      mudou = true;
    }
  }
  if (mudou) location.reload();
};

// Salva os dados do app na conta do usuário logado
window.salvarNaNuvem = async function () {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, "usuarios", user.uid), window.obterDadosNotaFacil());
  } catch (erro) {
    console.error("Erro ao salvar na nuvem:", erro);
    alert("Erro ao salvar: " + (erro.code || "") + " " + erro.message);
  }
};

// Carrega os dados da conta do usuário logado
window.carregarDaNuvem = async function () {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    if (snap.exists()) {
      window.aplicarDadosNotaFacil(snap.data());
    } else {
      await window.salvarNaNuvem();
    }
  } catch (erro) {
    console.error("Erro ao carregar da nuvem:", erro);
    alert("Erro ao carregar: " + (erro.code || "") + " " + erro.message);
  }
};

// Botão de sair
const botaoSair = document.createElement("button");
botaoSair.textContent = "Sair";
botaoSair.style.cssText =
  "position:fixed;top:10px;right:10px;z-index:9999;padding:8px 14px;border:none;border-radius:8px;background:#e5484d;color:#fff;font-weight:bold;display:none;";
document.body.appendChild(botaoSair);

botaoSair.addEventListener("click", async () => {
  await window.salvarNaNuvem();
  await signOut(auth);
  localStorage.clear();
  location.reload();
});

// Quando o usuário entra ou sai
onAuthStateChanged(auth, (user) => {
  botaoSair.style.display = user ? "block" : "none";
  if (user) window.carregarDaNuvem();
});
