// Verifica se o usuário está autenticado na sessão. Se não estiver, expulsa para o login.
if (sessionStorage.getItem("autenticado") !== "sim") {
  window.location.href = "login.html";
}

// Configurando BD Firebase, na nuvem, para o CRUD
const firebaseConfig = {
  apiKey: "AIzaSyAHSZPE64HX0eLrx3sxwVa4L3W-TVYsqSI",
  authDomain: "marcel-esquadrias.firebaseapp.com",
  projectId: "marcel-esquadrias",
  storageBucket: "marcel-esquadrias.firebasestorage.app",
  messagingSenderId: "756168483393",
  appId: "1:756168483393:web:13d626b2a15adb043f1cc0",
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function telaEmDesenvolvimento(event) {
  event.preventDefault();
  const container = document.getElementById("avisoDesenvolvimento");
  container.textContent = "Em breve, tela em desenvolvimento";
  container.style.display = "block";
  container.onclick = function () {
    container.style.display = "none";
  };
}

function carregarTotalMateriais() {
  // Busca a coleção no Firebase e conta o tamanho do "snapshot" (quantidade de registros)
  db.collection("materiais")
    .get()
    .then((querySnapshot) => {
      document.getElementById("totalMateriais").textContent =
        querySnapshot.size;
    })
    .catch((error) => {
      console.error("Erro ao carregar total:", error);
      document.getElementById("totalMateriais").textContent = "0";
    });
}

carregarTotalMateriais();

function fazerLogout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    // Apaga a chave de acesso da memória
    sessionStorage.removeItem("autenticado");
    window.location.href = "login.html";
  }
}
