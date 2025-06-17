const Participante = require('./Participante');
const Prova = require('./Prova');

/**
 * Representa um gabarito de prova associado a um participante e uma prova específica.
 */
class Gabarito {
  /**
   * Cria uma instância de Gabarito.
   * 
   * @param {Participante} participante - Instância da classe Participante.
   * @param {Prova} prova - Instância da classe Prova.
   * @param {string|Date} data - Data da realização da prova.
   * @param {string} caminho - Caminho relativo ou nome do arquivo do gabarito (ex: imagem).
   * @param {string} respostas - String com as respostas, ex: "ABCDEABCDEABCDEABCDE".
   * 
   * @throws {Error} Se participante ou prova não forem instâncias corretas.
   */
  constructor(participante, prova, data, caminho, respostas) {
    if (!(participante instanceof Participante))
      throw new Error("participante deve ser uma instância de Participante");

    if (!(prova instanceof Prova))
      throw new Error("prova deve ser uma instância de Prova");

    this.participante = participante;
    this.prova = prova;
    this.data = new Date(data);
    this.caminho = caminho;
    this.respostas = respostas;
  }

  /**
   * Retorna a resposta para a questão solicitada.
   * 
   * @param {number} questao - Número da questão (1-based).
   * @returns {string} Resposta da questão.
   * 
   * @throws {Error} Se a questão for inválida (menor que 1 ou maior que total de respostas).
   */
  getResposta(questao) {
    if (questao < 1 || questao > this.respostas.length)
      throw new Error("Questão inválida.");

    return this.respostas.charAt(questao - 1);
  }

  /**
   * Método customizado para serialização JSON.
   * Remove métodos e transforma objetos internos para JSON.
   * 
   * @returns {Object} Representação JSON do gabarito.
   */
  toJSON() {
    return {
      participante: this.participante, // Presume-se que Participante implemente toJSON
      prova: this.prova,               // Presume-se que Prova implemente toJSON
      data: this.data.toISOString(),
      caminho: this.caminho,
      respostas: this.respostas
    };
  }
}

module.exports = Gabarito;