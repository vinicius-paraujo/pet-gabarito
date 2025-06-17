let gabaritosCache = [];

// Inicio
document.querySelector('.enviar').addEventListener('click', () => {
  const nomeInput = document.getElementById('nome');
  const escolaInput = document.getElementById('escola');
  const dataInput = document.getElementById('data');

  if (!nomeInput || !escolaInput || !dataInput) {
    console.error('Um ou mais campos não foram encontrados no DOM.');
    Swal.fire({
      icon: 'error',
      title: 'Erro interno',
      text: 'Preencha todos os campos antes de prosseguir.'
    });
    return;
  }

  const nome = nomeInput.value.trim();
  const escola = escolaInput.value.trim();
  const data = dataInput.value;
  if (!nome || !escola || !data) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Por favor, preencha todos os campos antes de continuar.'
    });
    return;
  }

  sessionStorage.setItem('dadosGabarito', JSON.stringify({ nome, escola, data }));

  window.location.href = 'confirmar';
});

//alguns links eu usei onclick e outros addEventListener.
document.querySelector('.ver').addEventListener('click', () => {
  window.location.href = 'participantes';
});

document.addEventListener('DOMContentLoaded', () => {
  carregarGabaritos();

  document.querySelector('.buscar').addEventListener('click', () => {
    const filtro = document.getElementById('busca').value.trim();
    renderizarGabaritos(gabaritosCache, filtro);
  });

  document.getElementById('lista-arquivos').addEventListener('dblclick', (event) => {
    const idSelecionado = event.target.value;
    if (idSelecionado) {
      // Abrir imagem PNG em nova aba aqui
      window.open(`/images/${idSelecionado}`, '_blank'); 
    }
  });
});

document.getElementById('btn-deletar').addEventListener('click', async () => {
  const select = document.getElementById('lista-arquivos');
  const optionSelecionada = select.selectedOptions[0];

  if (!optionSelecionada || !optionSelecionada.dataset.numeroInscricao) {
    Swal.fire('Aviso', 'Selecione um gabarito válido para deletar.', 'warning');
    return;
  }

  const numeroInscricao = optionSelecionada.dataset.numeroInscricao;

  const confirmacao = await Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação irá remover o gabarito selecionado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, deletar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const resposta = await fetch(`/pet/gabarito/?numero_inscricao=${numeroInscricao}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || 'Erro ao deletar gabarito.');
    }

    Swal.fire('Sucesso!', 'Gabarito deletado com sucesso.', 'success');
    carregarGabaritos(); // atualiza lista
  } catch (erro) {
    Swal.fire('Erro!', erro.message || 'Falha ao deletar.', 'error');
  }
});

/**
 * Puxa os gabaritos do backend.
 */
function carregarGabaritos(filtro = '') {
  const url = "/pet/gabarito";

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar gabaritos');
      return res.json();
    })
    .then(gabaritos => {
      gabaritosCache = gabaritos;
      renderizarGabaritos(gabaritosCache, filtro);
    })
    .catch(err => {
      console.error('Erro ao carregar gabaritos:', err);
    });
}

function renderizarGabaritos(gabaritos, filtro = '') {
  const select = document.getElementById('lista-arquivos');
  select.innerHTML = '';

  const normalizados = filtro.toLowerCase();

  const filtrados = gabaritos.filter(gab =>
    gab.caminho.toLowerCase().includes(normalizados)
  );

  if (filtrados.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'Nenhum gabarito encontrado.';
    select.appendChild(opt);
    return;
  }

  filtrados.forEach(gab => {
    const option = document.createElement('option');
    option.value = gab.caminho;
    option.textContent = gab.caminho;
    option.dataset.numeroInscricao = gab.participante.numeroInscricao;
    select.appendChild(option);
  });
}
