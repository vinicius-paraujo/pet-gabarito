const Instituicao = require("../../data/Instituicao");
const MySQLPool = require("./MySQLPool");

class DatabaseManager {
    /** @type {MySQLPool} */
    #pool;

    constructor(env = process.env) {
        this.#pool = new MySQLPool({
            host: env.DATABASE_HOST,
            port: Number(env.DATABASE_PORT),
            user: env.DATABASE_USER,
            password: env.DATABASE_PASSWORD,
            database: env.DATABASE_NAME,
        });
    }

    /**
     * Inicializa e testa a conexão com o banco de dados.
     */
    async start() {
        try {
            await this.#pool.test();
            console.log("[Database] A conexão com o banco de dados SQL foi estabelecida com êxito.");

            await this.#initializeTables();
        } catch (erro) {
            console.log("[Database] Erro ao estabelecer conexão com o banco de dados: ");
            console.error(erro);
        }
   }

   /**
     * Inicializa as tabelas do banco de dados.
     */
    async #initializeTables() {
        const tablesSQL = `
            CREATE TABLE IF NOT EXISTS instituicao (
                id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS participantes (
                numero_inscricao INT NOT NULL PRIMARY KEY,
                nome_aluno VARCHAR(100) NOT NULL,
                instituicao_id INT NOT NULL,
                FOREIGN KEY (instituicao_id) REFERENCES instituicao(id)
            );

            CREATE TABLE IF NOT EXISTS gabaritos (
                numero_inscricao INT NOT NULL,
                caminho_imagem VARCHAR(255) NOT NULL,
                id_prova INT NOT NULL,
                data DATE NOT NULL,
                respostas VARCHAR(50) NOT NULL,
                FOREIGN KEY (numero_inscricao) REFERENCES participantes(numero_inscricao)
            );
        `;

        try {
            const connection = await this.#pool.getConnection();
            connection.query(tablesSQL);
            connection.release();

            console.log("[Database] As tabelas do banco de dados foram inicializadas com sucesso.");
        } catch (err) {
            console.error("[Database] Erro ao executar a criação/verificação das tabelas:");
            console.error(err);
        }
   }

   /**
     * Executa uma query no banco de dados.
     * @param {string} query
     * @param {Array<any>} [params]
     * @returns {Promise<Any>} Um ResultSet, se existir.
     */
    async query(sql, params = []) {
        const connection = await this.#pool.getConnection();
        try {
            const [results] = await connection.execute(sql, params);
            return results;
        } finally {
            connection.release();
        }
    }

   /**
     * Verifica se existe um participante com o número de inscrição informado.
     * 
     * @param {number} numeroInscricao - O número de inscrição do participante.
     * @returns {Promise<boolean>} True se existir, False caso contrário.
     */
    async existeParticipanteComNumero(numeroInscricao) {
        const results = await this.query(
            "SELECT 1 FROM participantes WHERE numero_inscricao = ? LIMIT 1",
            [numeroInscricao]
        );

        return results.length > 0;
    }

    /**
     * Busca uma instituição a partir do nome.
     * 
     * @param {string} nome
     * @returns {Promise<Instituicao|null>} A instância de Instituicao, ou null se não existir.
     */
    async procurarInstituicaoPorNome(nome) {
        const results = await this.query("SELECT * FROM instituicao WHERE nome = ?", [nome]);

        if (results.length === 0) return null;

        const { id, nome: nomeInstituicao } = results[0];
        return new Instituicao(id, nomeInstituicao);
    }

    /**
     * Registra uma nova instituição a partir do nome.
     * Se já existir, retorna a existente.
     * 
     * @param {string} nome
     * @returns {Promise<Instituicao>} A instância da instituição registrada ou existente.
     */
    async registrarInstituicao(nome) {
        const result = await this.query(
            "INSERT INTO instituicao (nome) VALUES (?)",
            [nome]
        );

        return new Instituicao(result.insertId, nome);
    }

    /**
     * 
     * @param {import("../../data/Gabarito")} gabarito 
     */
    async registrar(gabarito) {
        const connection = await this.#pool.getConnection();

        const participante = gabarito.participante;
        const instituicao = gabarito.participante.instituicao;
        const prova = gabarito.prova;

        try {
            await connection.beginTransaction();

            await connection.query(
                `INSERT INTO participantes (numero_inscricao, nome_aluno, instituicao_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE nome_aluno = VALUES(nome_aluno), instituicao_id = VALUES(instituicao_id)`,
                [participante.numeroInscricao, participante.nome, instituicao.id]
            );

            const ano = gabarito.data.getFullYear();
            const mes = String(gabarito.data.getMonth() + 1).padStart(2, "0"); // mês começa em 0
            const dia = String(gabarito.data.getDate()).padStart(2, "0");
            const dataFormatada = `${ano}-${mes}-${dia}`;
            
            await connection.query(
                `INSERT INTO gabaritos (numero_inscricao, id_prova, data, caminho_imagem, respostas)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    participante.numeroInscricao,
                    prova?.idProva ?? null,
                    dataFormatada,
                    gabarito.caminho,
                    gabarito.respostas
                ]
            );

            await connection.commit();
        } catch (err) {
            await connection.rollback(); // garante rollback se erro ocorrer
            console.error("[Erro] Falha ao registrar gabarito:", err);
            throw err; // opcional: repassa o erro para o chamador
        } finally {
            connection.release();
        }
    }

    async close() {
        await this.#pool.close();
    }
}

module.exports = DatabaseManager;