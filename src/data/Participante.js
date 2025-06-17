const Instituicao = require('./Instituicao');

class Participante {
    /**
     * Cria um participante.
     * @param {number} numeroInscricao - Número de inscrição único do participante.
     * @param {string} nome - Nome do participante.
     * @param {Instituicao} instituicao - Instância da instituição à qual o participante pertence.
     * @throws {Error} Se instituicao não for uma instância de Instituicao.
     */
    constructor(numeroInscricao, nome, instituicao) {
        if (!(instituicao instanceof Instituicao)) {
            throw new Error("Uma instância de Instituicao deve ser passada como parâmetro.");
        }

        this.numeroInscricao = numeroInscricao;
        this.nome = nome;
        this.instituicao = instituicao;
    }

    /**
     * Método usado para serialização JSON.
     * @returns {Object} Representação JSON do participante.
     */
    toJSON() {
        return {
            numeroInscricao: this.numeroInscricao,
            nome: this.nome,
            instituicao: this.instituicao
        };
    }
}

module.exports = Participante;