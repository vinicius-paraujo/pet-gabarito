const { parentPort, workerData } = require("worker_threads");
const leitor = require("../../build/Release/reading");

try {
  const resultado = leitor.GetReading(workerData.imagePath);
  parentPort.postMessage({ resultado });
} catch (error) {
  parentPort.postMessage({ error: error.message });
}