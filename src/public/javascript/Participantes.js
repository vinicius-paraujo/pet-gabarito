document.addEventListener('DOMContentLoaded', () => {
  carregarParticipantes();
  configurarFiltro();
  configurarAcoes();
});

/**
 * Carrega os participantes e renderiza na tabela.
 */
function carregarParticipantes() {
  fetch('/pet/gabarito/')
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar participantes');
      return response.json();
    })
    .then(data => renderizarTabela(data))
    .catch(error => {
      console.error(error);
      Swal.fire('Erro!', 'Não foi possível carregar os participantes.', 'error');
    });
}

/**
 * Renderiza os dados na tabela.
 */
function renderizarTabela(gabaritos) {
  const tabela = document.getElementById('tabela-participantes');
  tabela.innerHTML = '';

  gabaritos.forEach(gabarito => {
    const participante = gabarito.participante;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-nome">${participante.nome}</td>
      <td class="col-escola">${participante.instituicao.nome}</td>
      <td class="col-matricula">${formatarInscricao(participante.numeroInscricao)}</td>
      <td class="col-data">${formatarData(gabarito.data)}</td>
      <td class="col-imagem">
        <a href="/images/${gabarito.caminho}" target="_blank" rel="noopener noreferrer">Clique para ver</a>
      </td>
      <td>
        <button class="btn-editar" data-id="${participante.numeroInscricao}" title="Editar participante">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-deletar" data-id="${participante.numeroInscricao}" title="Deletar participante">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function formatarInscricao(inscricaoStr) {
  return String(inscricaoStr).padStart(9, '0');
}

/**
 * Formata uma data ISO em dd/mm/yyyy.
 */
function formatarData(isoString) {
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Configura o filtro por campo.
 */
function configurarFiltro() {
  const btnBuscar = document.getElementById('btn-buscar');

  btnBuscar.addEventListener('click', () => {
    const campoFiltro = document.getElementById('campo-filtro').value;
    const termoBusca = prompt(`Digite o valor para buscar por ${campoFiltro}:`);
    if (!termoBusca) return;

    const termo = termoBusca.trim().toLowerCase();
    const linhas = document.querySelectorAll('#tabela-participantes tr');

    linhas.forEach(linha => {
      const valor = {
        nome: linha.querySelector('.col-nome')?.textContent.toLowerCase(),
        escola: linha.querySelector('.col-escola')?.textContent.toLowerCase(),
        matricula: linha.querySelector('.col-matricula')?.textContent.toLowerCase()
      }[campoFiltro];

      linha.style.display = valor?.includes(termo) ? '' : 'none';
    });
  });
}

/**
 * Configura os eventos de clique para editar e deletar.
 */
function configurarAcoes() {
  document.addEventListener('click', event => {
    const btnEditar = event.target.closest(".btn-editar");
    const btnDeletar = event.target.closest(".btn-deletar");

    if (btnEditar) {
      const linha = btnEditar.closest('tr');
      enviarConfirmacaoEditar(linha);
    }

    if (btnDeletar) {
      const id = btnDeletar.getAttribute('data-id');
      confirmarDelecao(btnDeletar, id);
    }
  });
}

/**
 * Envia os dados do participante para a página de confirmação (modo edição).
 */
function enviarConfirmacaoEditar(linha) {
  const nome = linha.querySelector('.col-nome').textContent;
  const escola = linha.querySelector('.col-escola').textContent;
  const matricula = linha.querySelector('.col-matricula').textContent;
  const imagem = linha.querySelector('.col-imagem a').getAttribute('href');
  const dataStr = linha.querySelector('.col-data').textContent;
  const data = converterParaInputDate(dataStr);

  sessionStorage.setItem('dadosGabarito', JSON.stringify({
    nome,
    escola,
    matricula,
    data,
    imagem,
    editar: true
  }));

  window.location.href = 'confirmar';
}

/**
 * Converte uma data de "dd/mm/yyyy" para "yyyy-mm-dd".
 */
function converterParaInputDate(dataStr) {
  const [dia, mes, ano] = dataStr.split('/');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Confirma e executa a deleção de um participante.
 */
function confirmarDelecao(botao, id) {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação não poderá ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EC644C',
    cancelButtonColor: '#696666',
    confirmButtonText: 'Sim, deletar!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (!result.isConfirmed) return;

    fetch(`/pet/gabarito/?numero_inscricao=${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        Swal.fire('Deletado', 'O participante foi removido.', 'success');
        botao.closest('tr').remove();
      } else {
        Swal.fire('Erro', 'Não foi possível deletar.', 'error');
      }
    })
    .catch(() => {
      Swal.fire('Erro', 'Houve um problema na conexão.', 'error');
    });
  });
}