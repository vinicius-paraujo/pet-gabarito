const mysql = require("mysql2/promise");

class MySQLPool {
    /**
     * @type {mysql.Pool | null}
     */
    #pool = null;

    constructor(config) {
        if (config == null)
            throw new Error("É esperado previa configuração do dotenv para esse projeto.");

        this.#initializePool(config);
    }

    // Método privado para inicialização da classe.
    #initializePool(config) {
        this.#pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            waitForConnections: true,
            // Limite trivial para um ambiente controlado de testes.
            connectionLimit: config.connectionLimit || 10,
            queueLimit: config.queueLimit || 0,
            multipleStatements: true
        });
    }

    async getConnection() {
        if (!this.#pool) 
            throw new Error("A pool de conexões não foi inicializada e solicitada.");

        return await this.#pool.getConnection();
    }

    /**
     * Realiza um teste para ver se a pool está adequadamente funcionando.
     */
    async test() {
        const connection = await this.getConnection();
        await connection.ping();
        connection.release();
    }

    async close() {
        if (this.#pool) {
            await this.#pool.end();
            this.pool = null;
        }
    }
}

module.exports = MySQLPool;