function isDataFormatted(data) {
  if (typeof data !== "string") return false;

  // Regex para DD/MM/YYYY — dia 01-31, mês 01-12, ano 0000-9999
  const regex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/;
  if (!regex.test(data)) return false;

  // Data válida no calendário
  const [dia, mes, ano] = data.split("/").map(Number);
  const dateObj = new Date(ano, mes - 1, dia);

  return (
    dateObj.getFullYear() === ano &&
    dateObj.getMonth() === mes - 1 &&
    dateObj.getDate() === dia
  );
}

function validarNomeOuEscola(valor) {
  if (typeof valor !== "string") return false;

  const texto = valor.trim();

  if (texto.length === 0 || texto.length > 100) return false;

  // Permite letras, espaços, acentos e alguns sinais comuns
  // Pode ajustar conforme necessidade
  const regex = /^[A-Za-zÀ-ÿ\s.'-]+$/;

  return regex.test(texto);
}

function editarGabarito(database) {
  return async (req, res) => {
    const numeroInscricao = req.query.numero_inscricao;
    if (!numeroInscricao) {
      return res.status(400).json({
        erro: "Você não inseriu um número de inscrição válido.",
      });
    }

    const { escola, data, nome } = req.query;

    if (!escola && !data && !nome) {
      return res.status(400).json({
        erro: "Você não inseriu nenhum campo para mudança.",
        campos_aceitos: ["nome", "escola", "data"],
      });
    }

    if (nome !== undefined && !validarNomeOuEscola(nome)) {
      return res.status(400).json({
        erro:
          "Campo 'nome' inválido. Deve conter apenas letras, espaços, e ter entre 1 e 100 caracteres.",
      });
    }

    if (escola !== undefined && !validarNomeOuEscola(escola)) {
      return res.status(400).json({
        erro:
          "Campo 'escola' inválido. Deve conter apenas letras, espaços, e ter entre 1 e 100 caracteres.",
      });
    }

    if (data !== undefined && !isDataFormatted(data)) {
      return res.status(400).json({
        erro:
          "Campo 'data' inválido. Formato esperado: DD/MM/YYYY e data válida no calendário.",
      });
    }

    if (!(await database.existeParticipanteComNumero(numeroInscricao))) {
        return res.status(400).json({
            erro:
            "O número de inscrição inserido representa um registro que não existe."
        })
    }

    try {
        if (nome) {
            await alterarNomeAluno(numeroInscricao, nome, database);
        }

        if (escola) {
            await alterarNomeEscola(numeroInscricao, escola, database);
        }

        if (data) {
            const dataConvertida = converterDataParaISO(data); // de DD/MM/YYYY para YYYY-MM-DD
            await alterarData(numeroInscricao, dataConvertida, database);
        }

        return res.status(200).json({
            mensagem: "Gabarito atualizado com sucesso.",
        });
    } catch (erro) {
        console.error("[Erro ao editar gabarito]", erro);
        return res.status(500).json({
            erro: "Erro interno ao atualizar gabarito.",
            detalhes: erro.message,
        });
    }
  };
}

/**
 * Altera o nome do aluno com o número de inscrição especificado.
 * 
 * @param {number} numeroInscricao - Número de inscrição do participante.
 * @param {string} novoNome - Novo nome do aluno.
 * @param {import("../database/DatabaseManager")} database - Instância do gerenciador de banco de dados.
 * @returns {Promise<void>}
 */
async function alterarNomeAluno(numeroInscricao, novoNome, database) {
    if (typeof novoNome !== "string" || novoNome.trim().length === 0)
        throw new Error("Nome inválido.");

    const query = `
        UPDATE participantes
        SET nome_aluno = ?
        WHERE numero_inscricao = ?
    `;

    const resultado = await database.query(query, [novoNome.trim(), numeroInscricao]);
    if (resultado.affectedRows === 0)
        throw new Error("Participante não encontrado.");
}

/**
 * Altera a instituição associada ao participante.
 * 
 * @param {number} numeroInscricao - Número de inscrição do participante.
 * @param {string} novoNome - Nome da nova instituição.
 * @param {import("../database/DatabaseManager")} database - Instância do gerenciador de banco de dados.
 * @returns {Promise<void>}
 */
async function alterarNomeEscola(numeroInscricao, novoNome, database) {
    if (typeof novoNome !== "string" || novoNome.trim().length === 0)
        throw new Error("Nome da escola inválido.");

    const nomeTratado = novoNome.trim();

    // Verifica se a instituição já existe
    let instituicao = await database.procurarInstituicaoPorNome(nomeTratado);
    if (!instituicao) {
        instituicao = await database.registrarInstituicao(nomeTratado);
    }

    const query = `
        UPDATE participantes
        SET instituicao_id = ?
        WHERE numero_inscricao = ?
    `;

    const resultado = await database.query(query, [instituicao.id, numeroInscricao]);
    if (resultado.affectedRows === 0)
        throw new Error("Participante não encontrado.");
}

/**
 * Altera a data do gabarito do participante.
 * 
 * @param {number} numeroInscricao - Número de inscrição do participante.
 * @param {string} novaData - Nova data no formato YYYY-MM-DD.
 * @param {import("../database/DatabaseManager")} database - Instância do gerenciador de banco de dados.
 * @returns {Promise<void>}
 */
async function alterarData(numeroInscricao, novaData, database) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData))
        throw new Error("Formato de data inválido. Use YYYY-MM-DD.");

    const query = `
        UPDATE gabaritos
        SET data = ?
        WHERE numero_inscricao = ?
    `;

    const resultado = await database.query(query, [novaData, numeroInscricao]);
    if (resultado.affectedRows === 0)
        throw new Error("Gabarito não encontrado.");
}

/**
 * Converte uma data no formato DD/MM/YYYY para YYYY-MM-DD.
 * @param {string} data 
 * @returns {string}
 */
function converterDataParaISO(data) {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

module.exports = { editarGabarito };