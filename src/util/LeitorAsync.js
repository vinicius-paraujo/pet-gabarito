const path = require("path");
const { Worker } = require("worker_threads");

function run(imagePath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, "worker.js"), {
            workerData: { imagePath }
        });

        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker parou com o código ${code}`));
        });
    });
}

module.exports = { run };