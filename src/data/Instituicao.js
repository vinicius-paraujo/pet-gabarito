class Instituicao {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
    }

    /**
     * Método para serialização JSON.
     * Retorna apenas os dados essenciais da instituição.
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome
        };
    }
}

module.exports = Instituicao;