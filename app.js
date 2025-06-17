require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const routes = require("./src/assets/routes/root.routes");

const DatabaseManager = require("./src/assets/database/DatabaseManager");
const database = new DatabaseManager();

const RedisClient = require("./src/assets/database/RedisClient");
const rateLimiter = require("./src/util/rateLimiter");
const redis = new RedisClient({
    url: process.env.REDIS_URL
});

(async () => {
    await database.start();
    await redis.connect();
 
    const requestLimit = rateLimiter(redis.getClient());

    // Aplica o rate-limit globalmente.
    app.use(requestLimit("global", 100));

    // Definições do projeto
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "src/public")));
    app.use("/", routes({ database }));
    app.use((err, req, res, next) => {
        if (err) {
            console.error('[Erro Global]', {
                mensagem: err.message,
                stack: err.stack,
                codigo: err.code,
                nome: err.name,
                tipo: typeof err
            });

            // Tratamento específico para erros do multer
            if (err.code === 'LIMIT_FILE_SIZE')
                return res.status(413).json({ erro: 'Arquivo muito grande. Tamanho máximo permitido é 2MB.' });
            if (err.code === 'INVALID_FILE_TYPE')
                return res.status(415).json({ erro: 'Tipo de arquivo inválido. Apenas PNG, JPEG e JPG são permitidos.' });

            // Outros erros — registre de forma discreta, sem poluir logs
            console.error('Erro inesperado:', err.message);

            return res.status(500).json({ erro: 'Erro interno do servidor.' });
        }
        
        next();
    });

    const port = process.env.SERVER_PORT;
    app.listen(port, () => {
        console.log(`O servidor foi inicializado com sucesso na porta ${port}.`);
    });
})();
