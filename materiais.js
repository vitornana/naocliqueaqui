// lógica da tela de materiais — itens 7 e 8

var db = null;
var modoEdicao = false;
var idEditando = null;
var idExcluindo = null;
var categoriaAtiva = 'todos';
var todosOsMateriais = [];

// criação banco de dados local IndexedDB (item 8) 
function iniciarBanco() {
  var req = indexedDB.open('MarcelDB', 1);

  req.onupgradeneeded = function(e) {
    var banco = e.target.result;
    if (!banco.objectStoreNames.contains('materiais')) {
      var store = banco.createObjectStore('materiais', { keyPath: 'id', autoIncrement: true });
      store.createIndex('nome', 'nome', { unique: false });
    }
  };

  req.onsuccess = function(e) {
    db = e.target.result;
    carregarMateriais();
  };

  req.onerror = function(e) {
    console.error('Erro ao abrir banco:', e.target.error);
    alert('Não foi possível abrir o banco de dados local.');
  };
}

function carregarMateriais() {
  var tx = db.transaction('materiais', 'readonly');
  var store = tx.objectStore('materiais');
  var req = store.getAll();

  req.onsuccess = function() {
    todosOsMateriais = req.result || [];
    renderizar(todosOsMateriais);
  };

  req.onerror = function(e) {
    console.error('Erro ao carregar:', e.target.error);
  };
}

// começar a criar a tabela dinâmica
function gerarCodigo(id) {
  return 'MAT' + String(id).padStart(3, '0');
}

function badgeCategoria(cat) {
  var classes = {
    'Perfis':     'perfis',
    'Vidros':     'vidros',
    'Ferragens':  'ferragens',
    'Acessórios': 'acessorios'
  };
  var cls = classes[cat] || 'outros';
  return '<span class="badge ' + cls + '">' + cat + '</span>';
}

function renderizar(lista) {
  var tbody = document.getElementById('tbody');
  var msgVazia = document.getElementById('msgVazia');
  tbody.innerHTML = '';

  if (!lista || lista.length === 0) {
    msgVazia.style.display = 'flex';
    return;
  }

  msgVazia.style.display = 'none';

  for (var i = 0; i < lista.length; i++) {
    var m = lista[i];
    var preco = 'R$ ' + parseFloat(m.preco || 0).toFixed(2).replace('.', ',');
    var estoque = parseFloat(m.estoque || 0);
    var estoqueMin = parseFloat(m.estoqueMin || 0);
    var classeEstoque = (estoque > 0 && estoque > estoqueMin) ? 'estoque-val' : 'estoque-val estoque-baixo';

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="badge-un" style="font-weight:600;">' + gerarCodigo(m.id) + '</span></td>' +
      '<td>' + m.nome + '</td>' +
      '<td>' + badgeCategoria(m.categoria) + '</td>' +
      '<td><span class="badge-un">' + m.unidade + '</span></td>' +
      '<td>' + preco + '</td>' +
      '<td><span class="' + classeEstoque + '">' + estoque + '</span></td>' +
      '<td>' +
        '<div class="acoes-td">' +
          '<button class="btn-ver" title="Visualizar" onclick="verMaterial(' + m.id + ')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '</button>' +
          '<button class="btn-ed" title="Editar" onclick="abrirEdicao(' + m.id + ')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
          '<button class="btn-del" title="Excluir" onclick="abrirExcluir(' + m.id + ', \'' + m.nome.replace(/'/g, '\\\'') + '\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
          '</button>' +
        '</div>' +
      '</td>';

    tbody.appendChild(tr);
  }
}

// pop-up de uso exclusivo de visualização o qual veio do protótipo vindo do figma apresentado no trabalho de ES2 
function verMaterial(id) {
  var mat = null;
  for (var i = 0; i < todosOsMateriais.length; i++) {
    if (todosOsMateriais[i].id === id) { 
      mat = todosOsMateriais[i]; 
      break; 
    }
  }
  if (!mat) return;


  document.getElementById('verCodigo').textContent = gerarCodigo(mat.id);
  document.getElementById('verCategoria').textContent = mat.categoria || 'Outros';
  document.getElementById('verNome').textContent = mat.nome || '—';
  document.getElementById('verUnidade').textContent = mat.unidade || 'UN';
  
  var precoNum = parseFloat(mat.preco || 0);
  var estoqueNum = parseFloat(mat.estoque || 0);
  var estoqueMinNum = parseFloat(mat.estoqueMin || 0);
  var cotacaoNum = parseFloat(mat.cotacao || 0);

  document.getElementById('verPreco').textContent = 'R$ ' + precoNum.toFixed(2).replace('.', ',');
  document.getElementById('verEstoque').textContent = estoqueNum + ' ' + (mat.unidade || 'UN');
  document.getElementById('verEstoqueMin').textContent = estoqueMinNum + ' ' + (mat.unidade || 'UN');
  
  // valor total pra mostrar no modal
  var valorTotalEstoque = precoNum * estoqueNum;
  document.getElementById('verTotalEstoque').textContent = 'R$ ' + valorTotalEstoque.toFixed(2).replace('.', ',');

  document.getElementById('verFornecedor').textContent = mat.fornecedor || 'Não Informado';
  document.getElementById('verCotacao').textContent = 'R$ ' + cotacaoNum.toFixed(2).replace('.', ',');
  
  if (mat.dataCotacao) {
    var dataFormatada = mat.dataCotacao.split('-').reverse().join('/');
    document.getElementById('verDataCotacao').textContent = dataFormatada;
  } else {
    document.getElementById('verDataCotacao').textContent = '—';
  }

  document.getElementById('overlay').classList.add('show');
  document.getElementById('modalVer').classList.add('show');
}

function fecharModalVer() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('modalVer').classList.remove('show');
}

//  função parar filtrar a busca 
function filtrar() {
  var texto = document.getElementById('campoBusca').value.toLowerCase().trim();
  var lista = todosOsMateriais;

  if (categoriaAtiva !== 'todos') {
    lista = lista.filter(function(m) { return m.categoria === categoriaAtiva; });
  }

  if (texto !== '') {
    lista = lista.filter(function(m) {
      var cod = gerarCodigo(m.id).toLowerCase();
      return m.nome.toLowerCase().indexOf(texto) !== -1 || cod.indexOf(texto) !== -1;
    });
  }

  renderizar(lista);
}

function filtrarCategoria(cat, botao) {
  categoriaAtiva = cat;
  var botoes = document.querySelectorAll('.filtro-btn');
  for (var i = 0; i < botoes.length; i++) {
    botoes[i].classList.remove('ativo');
  }
  botao.classList.add('ativo');
  filtrar();
}

// modal para cadastro e edição
function abrirModal() {
  modoEdicao = false;
  idEditando = null;

  document.getElementById('modalTitulo').textContent = 'Novo Material';
  document.getElementById('modalSub').textContent = 'Cadastre um novo material no estoque';

  var proximoId = todosOsMateriais.length > 0
    ? Math.max.apply(null, todosOsMateriais.map(function(m) { return m.id; })) + 1
    : 1;
  document.getElementById('inputCodigo').value = gerarCodigo(proximoId);

  limparForm();

  document.getElementById('overlay').classList.add('show');
  document.getElementById('modal').classList.add('show');
  document.getElementById('inputNome').focus();
}

function abrirEdicao(id) {
  var mat = null;
  for (var i = 0; i < todosOsMateriais.length; i++) {
    if (todosOsMateriais[i].id === id) { mat = todosOsMateriais[i]; break; }
  }
  if (!mat) return;

  modoEdicao = true;
  idEditando = id;

  document.getElementById('modalTitulo').textContent = 'Editar Material';
  document.getElementById('modalSub').textContent = 'Atualize as informações do material';
  document.getElementById('inputCodigo').value = gerarCodigo(mat.id);
  document.getElementById('inputNome').value = mat.nome || '';
  document.getElementById('inputCategoria').value = mat.categoria || '';
  document.getElementById('inputUnidade').value = mat.unidade || '';
  document.getElementById('inputPreco').value = mat.preco || '';
  document.getElementById('inputEstoque').value = mat.estoque || '';
  document.getElementById('inputEstoqueMin').value = mat.estoqueMin || '';
  document.getElementById('inputFornecedor').value = mat.fornecedor || '';
  document.getElementById('inputCotacao').value = mat.cotacao || '';
  document.getElementById('inputDataCotacao').value = mat.dataCotacao || '';

  limparErros();

  document.getElementById('overlay').classList.add('show');
  document.getElementById('modal').classList.add('show');
}

function fecharModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
}

function fecharTodosModais() {
  fecharModal();
  fecharModalVer();
}
// salvar registro
function salvarMaterial() {
  limparErros();

  const nome = document.getElementById('inputNome').value.trim();
  const categoria = document.getElementById('inputCategoria').value;
  const unidade = document.getElementById('inputUnidade').value;
  const preco = document.getElementById('inputPreco').value;
  const estoque = document.getElementById('inputEstoque').value;

  let ok = true;

  if (nome === '') { mostrarErro('erroNome', 'Informe o nome.'); ok = false; }
  if (categoria === '') { mostrarErro('erroCategoria', 'Selecione a categoria.'); ok = false; }
  if (unidade === '') { mostrarErro('erroUnidade', 'Selecione a unidade.'); ok = false; }
  if (preco === '' || isNaN(preco) || parseFloat(preco) < 0) { mostrarErro('erroPreco', 'Preço inválido.'); ok = false; }
  if (estoque === '' || isNaN(estoque) || parseFloat(estoque) < 0) { mostrarErro('erroEstoque', 'Estoque inválido.'); ok = false; }

  if (!ok) return;

  const material = {
    nome:        nome,
    categoria:   categoria,
    unidade:     unidade,
    preco:       parseFloat(preco),
    estoque:     parseFloat(estoque),
    estoqueMin:  parseFloat(document.getElementById('inputEstoqueMin').value) || 0,
    fornecedor:  document.getElementById('inputFornecedor').value,
    cotacao:     parseFloat(document.getElementById('inputCotacao').value) || 0,
    dataCotacao: document.getElementById('inputDataCotacao').value
  };

  const tx = db.transaction('materiais', 'readwrite');
  const store = tx.objectStore('materiais');

  if (modoEdicao && idEditando !== null) {
    material.id = idEditando;
    store.put(material).onsuccess = function() {
      fecharModal();
      carregarMateriais();
    };
  } else {
    store.add(material).onsuccess = function() {
      fecharModal();
      carregarMateriais();
    };
  }
}

// excluir registro
function abrirExcluir(id, nome) {
  idExcluindo = id;
  document.getElementById('nomeExcluir').textContent = nome;
  document.getElementById('overlayDel').classList.add('show');
  document.getElementById('modalDel').classList.add('show');
}

function fecharModalDel() {
  document.getElementById('overlayDel').classList.remove('show');
  document.getElementById('modalDel').classList.remove('show');
  idExcluindo = null;
}

function confirmarExclusao() {
  if (idExcluindo === null) return;
  var tx = db.transaction('materiais', 'readwrite');
  var store = tx.objectStore('materiais');
  
  store.delete(idExcluindo).onsuccess = function() {
    fecharModalDel();
    carregarMateriais();
  };
}

// funções para limpar os valores digitados
function limparForm() {
  document.getElementById('inputNome').value = '';
  document.getElementById('inputCategoria').value = '';
  document.getElementById('inputUnidade').value = '';
  document.getElementById('inputPreco').value = '';
  document.getElementById('inputEstoque').value = '';
  document.getElementById('inputEstoqueMin').value = '';
  document.getElementById('inputFornecedor').value = '';
  document.getElementById('inputCotacao').value = '';
  document.getElementById('inputDataCotacao').value = '';
  limparErros();
}

function limparErros() {
  var erros = document.querySelectorAll('.erro');
  for (var i = 0; i < erros.length; i++) {
    erros[i].textContent = '';
    erros[i].classList.remove('vis');
  }
}

function mostrarErro(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('vis'); }
}

window.onload = function() {
  iniciarBanco();
};

function telaEmDesenvolvimento(event) {
  event.preventDefault();
  const container = document.getElementById('avisoDesenvolvimento');
  container.textContent = "Em breve, tela em desenvolvimento";
  container.style.display = "block";
  setTimeout(function() { container.style.display = "none"; }, 4000);
}

function fazerLogout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    window.location.href = 'login.html';
  }
}
;