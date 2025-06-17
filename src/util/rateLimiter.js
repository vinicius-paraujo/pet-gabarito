/**
 * Utilitário de rate limit baseado em IP e recurso, utilizando Redis como armazenamento.
 * 
 * @param {import('redis').RedisClientType} redisClient - Instância do cliente Redis já conectada.
 * @returns {(resource: string, limit?: number) => import('express').RequestHandler} 
 * 
 * @example
 * const rateLimiter = createRateLimiter(redisClient);
 * app.use(rateLimiter("login", 5));
 * 
 * // Isso limitará cada IP a no máximo 5 requisições por 30 segundos no recurso "login".
 */
module.exports = (redisClient) => {
    return (resource, limit = 10) => async (req, res, next) => {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const key = `rate-limit-${resource}-${ip}`;

        try {
            let requestCount = await redisClient.get(key);
            requestCount = requestCount ? Number(requestCount) : 0;
            requestCount += 1;

            await redisClient.set(key, requestCount, { EX: 30 });

            if (requestCount > limit)
                return res.status(429).json({ 
                    error: "Você atendeu o máximo de requisições por minuto, aguarde um pouco antes de tentar novamente." 
                });

            next();
        } catch (err) {
            console.error(`[RateLimiter] Erro ao acessar o Redis: ${err.message}`);
            return res.status(500).json({ error: "Erro interno no controle de requisições." });
        }
    };
};
