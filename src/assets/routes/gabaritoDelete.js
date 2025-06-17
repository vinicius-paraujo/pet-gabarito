/**
 * @param {import("../database/DatabaseManager")} database
 * @returns 
 */
function deletarGabarito(database) {
    return async (req, res) => {
        const numeroInscricao = req.query.numero_inscricao;
        if (!numeroInscricao) {
            return res.status(400).json({
                erro: "Você não inseriu um número de inscrição válido.",
            });
        }

        if (!(await database.existeParticipanteComNumero(numeroInscricao))) {
            return res.status(400).json({
                erro:
                "O número de inscrição inserido representa um registro que não existe."
            })
        }

        try {
            deletarGabaritoDatabase(numeroInscricao, database);

            return res.status(200).json({
                mensagem: "Gabarito deletado com sucesso.",
            });
        } catch (erro) {
            console.error("[Erro ao deletar gabarito]", erro);
            return res.status(500).json({
                erro: "Erro interno ao deletar gabarito.",
                detalhes: erro.message,
            });
        }
    }
}

async function deletarGabaritoDatabase(numeroInscricao, database) {
    // Remove da tabela gabaritos
    await database.query(
        `DELETE FROM gabaritos WHERE numero_inscricao = ?`,
        [numeroInscricao]
    );

    // Remove da tabela participantes
    await database.query(
        `DELETE FROM participantes WHERE numero_inscricao = ?`,
        [numeroInscricao]
    );
}

module.exports = { deletarGabarito };