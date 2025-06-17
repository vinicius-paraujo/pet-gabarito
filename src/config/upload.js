const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.resolve(__dirname, "..", "public", "images");

// Se o diretório não existe, ele deve ser gerado.
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

/**
 * Controla o armazenamento das imagens em disco.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const filename = `${base}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

/**
 * Filtra os tipos de arquivos enviados.
 * 
 * @function
 * @param {Express.Request} req - Objeto da requisição HTTP Express.
 * @param {Express.Multer.File} file - Objeto que representa o arquivo enviado.
 * @param {(error: Error|null, acceptFile: boolean) => void} cb - Callback que define se o arquivo será aceito.
 * 
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Formato de imagem inválido: ${file.mimetype}. Permitidos: ${allowed.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE'; // importante para tratamento posterior
    cb(error, false);
  }
};

module.exports = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8MB é mais que adequado para o ambiente controlado de testes.
  }
});