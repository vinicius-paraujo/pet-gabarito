const express = require("express");
const router = express.Router();

const upload = require ("../../config/upload");
const { filtrarGabaritos } = require("./gabaritoFiltro");
const path = require("path");
const postarGabarito = require("./gabaritoPost");
const { editarGabarito } = require("./gabaritoEdit");
const { deletarGabarito } = require("./gabaritoDelete");

/**
 * @param {import("../database/DatabaseManager")} database
 */
module.exports = ({ database }) => {
    // Index
    router.get("/", (req, res) => {
        const filePath = path.join(__dirname, "../../public/html/index.html");
        res.sendFile(filePath);
    });

    // Confirmar
    router.get("/confirmar", (req, res) => {
        const filePath = path.join(__dirname, "../../public/html/confirmacao.html");
        res.sendFile(filePath);
    });

    // Participantes
    router.get("/participantes", (req, res) => {
        const filePath = path.join(__dirname, "../../public/html/participantes.html");
        res.sendFile(filePath);
    });

    /**
     * Executa uma busca por gabaritos, se baseando ou não em um filtro.
     */
    router.get("/pet/gabarito", async (req, res) => {
        await filtrarGabaritos(req, res, database);
    });

    // Registra um novo gabarito
    router.post("/pet/gabarito/", 
        upload.fields([{ name: 'imagem', maxCount: 1 }]), 
        postarGabarito(database)
    );

    // Edição de um gabarito
    router.patch("/pet/gabarito/", editarGabarito(database));
    // Remoção de um gabarito
    router.delete("/pet/gabarito/", deletarGabarito(database));

    return router;
}