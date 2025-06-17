const { createClient } = require("redis");

class RedisClient {
    /** @type {import("redis").RedisClientType | null} */
    #client = null;

    constructor(config) {
        if (!config || typeof config.url !== "string")
            throw new Error("Configuração inválida para o Redis.");

        this.#client = createClient({ url: config.url });
    }

    async connect() {
        if (!this.#client)
            throw new Error("Cliente Redis não inicializado.");

        try {
            await this.#client.connect();
            await this.test();
            console.log("[Redis] A conexão foi estabelecida com sucesso.");
        } catch (erro) {
            console.warn(`[Redis] Não foi possível executar a conexão: ${erro.message}`);
        }
    }

    getClient() {
        if (!this.#client)
            throw new Error("Cliente Redis não disponível.");
        return this.#client;
    }

    async test() {
        await this.#client.ping();
    }
}

module.exports = RedisClient;