const Filtro = require("../../data/Filtro");

/**
 * Filtra os gabaritos conforme o critério enviado na query string.
 * Se nenhum filtro for especificado, a ordenação será por data.
 * 
 * @param {import("express").Request} req - Requisição HTTP.
 * @param {import("express").Response} res - Resposta HTTP.
 * @param {import("../database/DatabaseManager")} database - Gerenciador de conexão com o banco de dados.
 */
async function filtrarGabaritos(req, res, database) {
  const filtro = req.query.filtro;

  // Se filtro for definido, validar
  if (filtro && !Object.values(Filtro).includes(filtro.toUpperCase())) {
    return res.status(400).json({
      erro: "Filtro inválido. Utilize um dos valores permitidos.",
      filtros_aceitos: Object.values(Filtro),
    });
  }

  try {

    const resultado = await buscarPorFiltro(filtro, database);
    return res.json(resultado);
  } catch (erro) {
    console.error("Erro ao buscar gabaritos:", erro);
    return res.status(500).json({ erro: "Erro interno ao buscar gabaritos." });
  }
}

const Gabarito = require("../../data/Gabarito");
const Participante = require("../../data/Participante");
const Prova = require("../../data/Prova");
const Instituicao = require("../../data/Instituicao");

/**
 * Executa a query correspondente ao filtro informado.
 * Se nenhum filtro for fornecido, ordena por data.
 * 
 * @param {string | undefined} filtro - Tipo de ordenação solicitado, ou undefined.
 * @param {import("../database/DatabaseManager")} database - Instância de controle de banco de dados.
 * @returns {Promise<Array<any>>} Lista de gabaritos ordenada conforme o filtro.
 */
async function buscarPorFiltro(filtro, database) {
  let orderClause;

  if (filtro) filtro = filtro.toUpperCase();
  switch (filtro) {
    case Filtro.NOME_ALUNO:
      orderClause = "ORDER BY p.nome_aluno";
      break;
    case Filtro.NUMERO_INSCRICAO:
      orderClause = "ORDER BY p.numero_inscricao";
      break;
    case Filtro.INSTITUICAO:
      orderClause = "ORDER BY i.nome";
      break;
    case undefined:
      orderClause = "ORDER BY g.data";
      break;
    default:
      throw new Error("Filtro não implementado.");
  }

  const query = `
    SELECT 
      g.data, g.numero_inscricao, g.id_prova, g.respostas, g.caminho_imagem,
      p.nome_aluno, p.instituicao_id,
      i.id AS instituicao_id, i.nome AS instituicao_nome
    FROM gabaritos g
    JOIN participantes p ON g.numero_inscricao = p.numero_inscricao
    JOIN instituicao i ON p.instituicao_id = i.id
    ${orderClause}
  `;

  const linhas = await database.query(query);

  // Mapeia cada linha em uma instância de Gabarito
  const gabaritos = linhas.map(linha => {
    const instituicao = new Instituicao(linha.instituicao_id, linha.instituicao_nome);
    const participante = new Participante(
      linha.numero_inscricao,
      linha.nome_aluno,
      instituicao
    );
    const prova = new Prova(linha.id_prova);

    return new Gabarito(
      participante,
      prova,
      linha.data,
      linha.caminho_imagem,
      linha.respostas
    );
  });

  // Serializa em JSON
  return gabaritos.map(g => g.toJSON());
}

module.exports = { filtrarGabaritos };