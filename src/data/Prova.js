class Prova {
    /**
     * Cria uma instância de Prova, definindo modalidade e fase a partir do id.
     * @param {number} idProva - Identificador único da prova.
     */
    constructor(idProva) {
        this.idProva = idProva;
        this.#encontrarFaseModadalidadePorId();
    }

    /** @private */
    #encontrarFaseModadalidadePorId() {
        const provas = {
            1: { modalidade: "Iniciação A", fase: 1 },
            2: { modalidade: "Iniciação B", fase: 1 },
            3: { modalidade: "Programação", fase: 1 },
            4: { modalidade: "Iniciação A", fase: 2 },
            5: { modalidade: "Iniciação B", fase: 2 },
            6: { modalidade: "Programação", fase: 2 }
        };

        const prova = provas[this.idProva];
        if (prova != null) {
            this.fase = prova.fase;
            this.modalidade = prova.modalidade;
        }
    }

    /**
     * Método para serialização JSON.
     * Retorna um objeto com as propriedades essenciais.
     * @returns {{ idProva: number, fase: number|null, modalidade: string|null }}
     */
    toJSON() {
        return {
            idProva: this.idProva,
            fase: this.fase,
            modalidade: this.modalidade
        };
    }
}

module.exports = Prova;