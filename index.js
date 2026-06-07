// Para um código mais organizado e limpo fizemos um arquivo separado do index.html para separar o js mesmo com o tamanho reduzido

function telaEmDesenvolvimento(event) {
  event.preventDefault();
  const container = document.getElementById('avisoDesenvolvimento');
  container.textContent = "Em breve, tela em desenvolvimento";
  container.style.display = "block";
  setTimeout(function() { container.style.display = "none"; }, 4000);
}

function carregarTotalMateriais() {
  const req = indexedDB.open('MarcelDB', 1);
  req.onsuccess = function(e) {
    const db = e.target.result;
    if (db.objectStoreNames.contains('materiais')) {
      const tx = db.transaction('materiais', 'readonly');
      const store = tx.objectStore('materiais');
      const countReq = store.count();
      countReq.onsuccess = function() {
        document.getElementById('totalMateriais').textContent = countReq.result;
      };
    }
  };
}

carregarTotalMateriais();

function fazerLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    window.location.href = 'login.html';
  }
}
