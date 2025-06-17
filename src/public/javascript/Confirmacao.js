window.addEventListener('DOMContentLoaded', () => {
  const dados = JSON.parse(sessionStorage.getItem('dadosGabarito') || '{}');
  const editar = dados.editar;
  const elementos = inicializarElementos();

  carregarDadosDaSessao(dados, elementos, editar);  // importante passar o editar aqui
  configurarEdicao(elementos);
  configurarFormulario(dados, editar, elementos);
});

function inicializarElementos() {
  return {
    nome: document.getElementById('nome'),
    escola: document.getElementById('escola'),
    data: document.getElementById('data'),
    botaoEditar: document.getElementById('btn-editar'),
    formulario: document.getElementById('confirmacao-gabarito'),
    linkImagem: document.getElementById('imagem'),
    inputImagem: document.getElementById('input-imagem'),
    labelImagem: document.getElementById('label-imagem'),
  };
}

function carregarDadosDaSessao(dados, elementos, editar) {
  const { nome, escola, data, linkImagem, inputImagem, labelImagem } = elementos;

  nome.value = dados.nome || '';
  escola.value = dados.escola || '';
  data.value = dados.data || '';

  if (editar) {
    // modo edição: não mostra input file, mostra só link para imagem
    inputImagem.style.display = 'none';
    labelImagem.style.display = 'none';

    if (dados.imagem) {
      linkImagem.href = dados.imagem;
      linkImagem.textContent = 'Clique para visualizar o arquivo';
      linkImagem.style.display = 'inline';
    } else {
      linkImagem.textContent = 'Arquivo não disponível';
      linkImagem.removeAttribute('href');
    }
  } else {
    // modo cadastro: mostra input file, esconde o link
    inputImagem.style.display = 'block';
    labelImagem.style.display = 'block';
    linkImagem.style.display = 'none';
  }

  nome.readOnly = true;
  escola.readOnly = true;
  data.readOnly = true;
}

function configurarEdicao({ botaoEditar, nome, escola, data }) {
  let editando = false;

  botaoEditar.addEventListener('click', () => {
    editando = !editando;

    nome.readOnly = !editando;
    escola.readOnly = !editando;
    data.readOnly = !editando;

    botaoEditar.textContent = editando ? 'Salvar Edição' : 'Editar';
  });
}

function configurarFormulario(dados, editar, { formulario, nome, escola, data }) {
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      if (editar) {
        await enviarEdicao(dados.matricula, {
          nome: nome.value,
          escola: escola.value,
          data: data.value
        });
      } else {
        const arquivoInput = document.getElementById('input-imagem'); // deve existir no DOM
        const formData = new FormData();
        formData.append('nome', nome.value);
        formData.append('escola', escola.value);
        formData.append('data', data.value);
        formData.append('imagem', arquivoInput?.files?.[0]);

        await enviarCadastro(formData);
      }

      Swal.fire('Sucesso!', 'Dados enviados com sucesso.', 'success').then(() => {
        sessionStorage.clear();
        localStorage.removeItem('editar');
        window.location.href = '/';
      });
    } catch (erro) {
      Swal.fire('Erro!', erro.message || 'Falha ao enviar os dados.', 'error');
    }
  });
}

async function enviarCadastro(formData) {
  const resposta = await fetch('/pet/gabarito/', {
    method: 'POST',
    body: formData
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.erro || 'Erro ao cadastrar participante.');
  }
}

async function enviarEdicao(numeroInscricao, { nome, escola, data }) {
  data = formatarData(data);
  const query = new URLSearchParams({
    numero_inscricao: numeroInscricao,
    nome,
    escola,
    data // formato dd/mm/yyyy
  });

  const resposta = await fetch(`/pet/gabarito/?${query.toString()}`, {
    method: 'PATCH'
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.erro || 'Erro ao editar participante.');
  }
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}