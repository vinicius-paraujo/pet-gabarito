const fs = require("fs/promises");
const path = require("path");

const LeitorAsync = require("../../util/LeitorAsync");
const Prova = require("../../data/Prova");
const Participante = require("../../data/Participante");
const Gabarito = require("../../data/Gabarito");

/**
 * Função de controle para processar o envio de gabarito via formulário multipart.
 * Espera campos: nome, escola, data, imagem.
 */
function postarGabarito(database) {
    return async (req, res) => {
        const { nome, escola, data } = req.body;
        const imagem = req.files?.imagem?.[0];

        if (!nome || !escola || !data || !imagem) {
            return res.status(400).json({
                erro: "Os campos necessários não foram preenchidos. Tente novamente."
            });
        }

        const validTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!validTypes.includes(imagem.mimetype)) {
            return res.status(415).json({
                erro: "O formato de imagem inserida é inválido."
            });
        }

        try {
            const dados = await LeitorAsync.run(imagem.path);
            if (typeof dados !== "object" || typeof dados.resultado !== "object" || typeof dados.resultado.erro !== "number") {
                return res.status(500).json({ erro: "Erro interno ao ler e processar o gabarito." });
            }

            const nomeArquivo = path.basename(imagem.path);
            executarTratamentoGabarito(dados.resultado, nomeArquivo, req, res, database);
        } catch (err) {
            console.error("[Erro] Processamento do gabarito:", err);
            return res.status(500).json({ erro: "Falha ao processar o gabarito." });
        }
    };
}

function executarTratamentoGabarito(resultado, caminho, req, res, database) {
    const respostas = {
        0: async () => {
            const existe = await database.existeParticipanteComNumero(resultado.id_participante);
            if (existe) {
                try {
                    const imagem = req.files?.imagem?.[0];
                    if (imagem) await fs.unlink(imagem.path);
                } catch (err) {
                    console.error("[Aviso] Falha ao remover imagem descartada:", err.message);
                }

                return res.status(409).json({
                    erro: "Já existe um participante com este número de inscrição registrado."
                });
            }

            await registrarNoBancoDeDados(resultado, caminho, req, database);

            return res.status(200).json({
                mensagem: "Gabarito processado com sucesso.",
                id_prova: resultado.id_prova,
                id_participante: resultado.id_participante,
                leitura: resultado.leitura
            });
        },
        1: () => res.status(422).json({ erro: "Erro de leitura do código Aztec." }),
        2: () => res.status(422).json({ erro: "Imprecisão ou erro na identificação da área de leitura." }),
        3: () => res.status(500).json({ erro: "Erro fatal durante a leitura do gabarito." }),
        default: () => res.status(500).json({ erro: "Erro desconhecido durante a leitura do gabarito." }),
    };

    const responder = respostas[resultado.erro] || respostas.default;
    responder();
}

async function registrarNoBancoDeDados(resultado, caminho, req, database) {
    const { nome, escola, data } = req.body;

    let instituicao = await database.procurarInstituicaoPorNome(escola);
    if (!instituicao) {
        instituicao = await database.registrarInstituicao(escola);
    }

    const prova = typeof resultado.id_prova === "number" ? new Prova(resultado.id_prova) : null;
    const numeroInscricao = typeof resultado.id_participante === "number" ? resultado.id_participante : null;

    const participante = new Participante(numeroInscricao, nome, instituicao);
    const gabarito = new Gabarito(participante, prova, data, caminho, resultado.leitura);

    await database.registrar(gabarito);
}

module.exports = postarGabarito;