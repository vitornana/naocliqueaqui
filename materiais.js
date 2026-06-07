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

// lógica da tela de materiais — itens 7 e 8
let modoEdicao = false;
let idEditando = null;
let idExcluindo = null;
let categoriaAtiva = "todos";
let todosOsMateriais = [];

function carregarMateriais() {
  db.collection("materiais")
    .get()
    .then((querySnapshot) => {
      todosOsMateriais = [];
      querySnapshot.forEach((doc) => {
        // doc.data() traz as informações, e doc.id traz o código único gerado pelo Google
        let mat = doc.data();
        mat.id = doc.id;
        todosOsMateriais.push(mat);
      });
      renderizar(todosOsMateriais);
    })
    .catch((error) => {
      console.error("Erro ao buscar materiais na nuvem:", error);
    });
}

function gerarCodigo(sequencial) {
  if (!sequencial) return "MAT-NOVO";
  return "MAT-" + String(sequencial).padStart(3, "0");
}

function badgeCategoria(cat) {
  const classes = {
    Perfis: "perfis",
    Vidros: "vidros",
    Ferragens: "ferragens",
    Acessórios: "acessorios",
  };
  const cls = classes[cat] || "outros";
  return '<span class="badge ' + cls + '">' + cat + "</span>";
}

function renderizar(lista) {
  const tbody = document.getElementById("tbody");
  const msgVazia = document.getElementById("msgVazia");
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    msgVazia.style.display = "flex";
    return;
  }

  msgVazia.style.display = "none";

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    const preco =
      "R$ " +
      parseFloat(m.preco || 0)
        .toFixed(2)
        .replace(".", ",");
    const estoque = parseFloat(m.estoque || 0);
    const estoqueMin = parseFloat(m.estoqueMin || 0);
    const classeEstoque =
      estoque > 0 && estoque > estoqueMin
        ? "estoque-val"
        : "estoque-val estoque-baixo";

    const tr = document.createElement("tr");

    // O uso da crase (`) permite injetar as variáveis diretamente com ${} e evita erros de aspas
    tr.innerHTML = `
      <td><span class="badge-un" style="font-weight:600;">${gerarCodigo(m.codigoSequencial)}</span></td>
      <td>${m.nome}</td>
      <td>${badgeCategoria(m.categoria)}</td>
      <td><span class="badge-un">${m.unidade}</span></td>
      <td>${preco}</td>
      <td><span class="${classeEstoque}">${estoque}</span></td>
      <td>
        <div class="acoes-td">
          <button class="btn-ver" title="Visualizar" onclick="verMaterial('${m.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-ed" title="Editar" onclick="abrirEdicao('${m.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-del" title="Excluir" onclick="abrirExcluir('${m.id}', '${m.nome.replace(/'/g, "\\'")}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

// pop-up de uso exclusivo de visualização o qual veio do protótipo vindo do figma apresentado no trabalho de ES2
function verMaterial(id) {
  let mat = null;
  for (let i = 0; i < todosOsMateriais.length; i++) {
    if (todosOsMateriais[i].id === id) {
      mat = todosOsMateriais[i];
      break;
    }
  }
  if (!mat) return;

  document.getElementById("verCodigo").textContent = gerarCodigo(
    mat.codigoSequencial,
  );
  document.getElementById("verCategoria").textContent =
    mat.categoria || "Outros";
  document.getElementById("verNome").textContent = mat.nome || "—";
  document.getElementById("verUnidade").textContent = mat.unidade || "UN";

  const precoNum = parseFloat(mat.preco || 0);
  const estoqueNum = parseFloat(mat.estoque || 0);
  const estoqueMinNum = parseFloat(mat.estoqueMin || 0);
  const cotacaoNum = parseFloat(mat.cotacao || 0);

  document.getElementById("verPreco").textContent =
    "R$ " + precoNum.toFixed(2).replace(".", ",");
  document.getElementById("verEstoque").textContent =
    estoqueNum + " " + (mat.unidade || "UN");
  document.getElementById("verEstoqueMin").textContent =
    estoqueMinNum + " " + (mat.unidade || "UN");

  // valor total pra mostrar no modal
  const valorTotalEstoque = precoNum * estoqueNum;
  document.getElementById("verTotalEstoque").textContent =
    "R$ " + valorTotalEstoque.toFixed(2).replace(".", ",");

  document.getElementById("verFornecedor").textContent =
    mat.fornecedor || "Não Informado";
  document.getElementById("verCotacao").textContent =
    "R$ " + cotacaoNum.toFixed(2).replace(".", ",");

  if (mat.dataCotacao) {
    const dataFormatada = mat.dataCotacao.split("-").reverse().join("/");
    document.getElementById("verDataCotacao").textContent = dataFormatada;
  } else {
    document.getElementById("verDataCotacao").textContent = "—";
  }

  document.getElementById("overlay").classList.add("show");
  document.getElementById("modalVer").classList.add("show");
}

function fecharModalVer() {
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("modalVer").classList.remove("show");
}

//  função parar filtrar a busca
function filtrar() {
  const texto = document
    .getElementById("campoBusca")
    .value.toLowerCase()
    .trim();
  let lista = todosOsMateriais;

  if (categoriaAtiva !== "todos") {
    lista = lista.filter(function (m) {
      return m.categoria === categoriaAtiva;
    });
  }

  if (texto !== "") {
    lista = lista.filter(function (m) {
      const cod = gerarCodigo(m.id).toLowerCase();
      return (
        m.nome.toLowerCase().indexOf(texto) !== -1 || cod.indexOf(texto) !== -1
      );
    });
  }

  renderizar(lista);
}

function filtrarCategoria(cat, botao) {
  categoriaAtiva = cat;
  const botoes = document.querySelectorAll(".filtro-btn");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].classList.remove("ativo");
  }
  botao.classList.add("ativo");
  filtrar();
}

// modal para cadastro e edição
function abrirModal() {
  modoEdicao = false;
  idEditando = null;

  document.getElementById("modalTitulo").textContent = "Novo Material";
  document.getElementById("modalSub").textContent =
    "Cadastre um novo material no estoque";

  // Descobre qual é o próximo número sequencial disponível
  const proximoSeq =
    todosOsMateriais.length > 0
      ? Math.max(...todosOsMateriais.map((m) => m.codigoSequencial || 0)) + 1
      : 1;

  // Mostra MAT-00X na tela e esconde o número puro no atributo 'data-seq'
  document.getElementById("inputCodigo").value = gerarCodigo(proximoSeq);
  document.getElementById("inputCodigo").dataset.seq = proximoSeq;

  limparForm();
  document.getElementById("overlay").classList.add("show");
  document.getElementById("modal").classList.add("show");
  document.getElementById("inputNome").focus();
}

function abrirEdicao(id) {
  let mat = null;
  for (let i = 0; i < todosOsMateriais.length; i++) {
    if (todosOsMateriais[i].id === id) {
      mat = todosOsMateriais[i];
      break;
    }
  }
  if (!mat) return;

  modoEdicao = true;
  idEditando = id;

  document.getElementById("modalTitulo").textContent = "Editar Material";
  document.getElementById("modalSub").textContent =
    "Atualize as informações do material";
  document.getElementById("inputCodigo").value = gerarCodigo(
    mat.codigoSequencial,
  );

  document.getElementById("inputNome").value = mat.nome || "";
  document.getElementById("inputCategoria").value = mat.categoria || "";
  document.getElementById("inputUnidade").value = mat.unidade || "";
  document.getElementById("inputFornecedor").value = mat.fornecedor || "";
  document.getElementById("inputDataCotacao").value = mat.dataCotacao || "";

  // Para campos numéricos, usamos a verificação !== undefined para o 0 não sumir
  document.getElementById("inputPreco").value =
    mat.preco !== undefined ? mat.preco : "";
  document.getElementById("inputEstoque").value =
    mat.estoque !== undefined ? mat.estoque : "";
  document.getElementById("inputEstoqueMin").value =
    mat.estoqueMin !== undefined ? mat.estoqueMin : "";
  document.getElementById("inputCotacao").value =
    mat.cotacao !== undefined ? mat.cotacao : "";

  limparErros();

  document.getElementById("overlay").classList.add("show");
  document.getElementById("modal").classList.add("show");
}

function fecharModal() {
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("modal").classList.remove("show");
}

function fecharTodosModais() {
  fecharModal();
  fecharModalVer();
}

function salvarMaterial() {
  limparErros();

  const nome = document.getElementById("inputNome").value.trim();
  const categoria = document.getElementById("inputCategoria").value;
  const unidade = document.getElementById("inputUnidade").value;
  const preco = document.getElementById("inputPreco").value;

  // Forçar o zero caso o usuário não digite nada
  let estoque = document.getElementById("inputEstoque").value;
  if (estoque === "") {
    estoque = "0";
  }

  let ok = true;

  if (nome === "") {
    mostrarErro("erroNome", "Informe o nome.");
    ok = false;
  }

  if (categoria === "") {
    mostrarErro("erroCategoria", "Selecione a categoria.");
    ok = false;
  }

  if (unidade === "") {
    mostrarErro("erroUnidade", "Selecione a unidade.");
    ok = false;
  }

  const precoNum = parseFloat(preco);
  if (preco === "" || isNaN(precoNum) || precoNum < 0) {
    mostrarErro("erroPreco", "O preço não pode ser negativo.");
    ok = false;
  }

  const estoqueNum = parseFloat(estoque);
  if (isNaN(estoqueNum) || estoqueNum < 0) {
    mostrarErro("erroEstoque", "O estoque não pode ser negativo.");
    ok = false;
  }

  if (!ok) return;

  const material = {
    nome: nome,
    categoria: categoria,
    unidade: unidade,
    preco: precoNum,
    estoque: estoqueNum,
    estoqueMin:
      parseFloat(document.getElementById("inputEstoqueMin").value) || 0,
    fornecedor: document.getElementById("inputFornecedor").value,
    cotacao: parseFloat(document.getElementById("inputCotacao").value) || 0,
    dataCotacao: document.getElementById("inputDataCotacao").value,
  };

  if (!modoEdicao) {
    material.codigoSequencial =
      parseInt(document.getElementById("inputCodigo").dataset.seq) || 1;
  }

  const btnSalvar = document.querySelector(".btn-salvar");
  btnSalvar.textContent = "Salvando...";

  if (modoEdicao && idEditando !== null) {
    db.collection("materiais")
      .doc(idEditando)
      .update(material)
      .then(() => {
        fecharModal();
        carregarMateriais();
        btnSalvar.textContent = "Salvar Material";
      });
  } else {
    db.collection("materiais")
      .add(material)
      .then(() => {
        fecharModal();
        carregarMateriais();
        btnSalvar.textContent = "Salvar Material";
      });
  }
}

// excluir registro
function abrirExcluir(id, nome) {
  idExcluindo = id;
  document.getElementById("nomeExcluir").textContent = nome;
  document.getElementById("overlayDel").classList.add("show");
  document.getElementById("modalDel").classList.add("show");
}

function fecharModalDel() {
  document.getElementById("overlayDel").classList.remove("show");
  document.getElementById("modalDel").classList.remove("show");
  idExcluindo = null;
}

function confirmarExclusao() {
  if (idExcluindo === null) return;

  const btnExcluir = document.querySelector(".btn-excluir");
  btnExcluir.textContent = "Excluindo...";

  db.collection("materiais")
    .doc(idExcluindo)
    .delete()
    .then(() => {
      fecharModalDel();
      carregarMateriais();
      btnExcluir.textContent = "Excluir";
    });
}

function limparForm() {
  document.getElementById("inputNome").value = "";
  document.getElementById("inputCategoria").value = "";
  document.getElementById("inputUnidade").value = "";
  document.getElementById("inputPreco").value = "";
  document.getElementById("inputEstoque").value = "";
  document.getElementById("inputEstoqueMin").value = "";
  document.getElementById("inputFornecedor").value = "";
  document.getElementById("inputCotacao").value = "";
  document.getElementById("inputDataCotacao").value = "";
  limparErros();
}

function limparErros() {
  const erros = document.querySelectorAll(".erro");
  for (let i = 0; i < erros.length; i++) {
    erros[i].textContent = "";
    erros[i].classList.remove("vis");
  }
}

function mostrarErro(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add("vis");
  }
}

window.onload = function () {
  carregarMateriais();
};

function telaEmDesenvolvimento(event) {
  event.preventDefault();
  const container = document.getElementById("avisoDesenvolvimento");
  container.textContent = "Em breve, tela em desenvolvimento";
  container.style.display = "block";
  container.onclick = function () {
    container.style.display = "none";
  };
}

function fazerLogout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    // Apaga a chave de acesso da memória
    sessionStorage.removeItem("autenticado");
    window.location.href = "login.html";
  }
}
