// Configurando BD na nuvem para o Dashboard
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
  setTimeout(function () {
    container.style.display = "none";
  }, 4000);
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
    window.location.href = "login.html";
  }
}
