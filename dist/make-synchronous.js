// @ts-nocheck

// source/make-synchronous.ts
import { parentPort, receiveMessageOnPort, Worker, workerData } from "node:worker_threads";
var IS_WORKER_MARK = "is-make-synchronous-worker";
var IS_WORKER = workerData?.[IS_WORKER_MARK];
function setupWorker(function_) {
  const { workerPort } = workerData;
  parentPort.on("message", async ({ arguments_, semaphore }) => {
    try {
      workerPort.postMessage({ result: await function_(...arguments_) });
    } catch (error) {
      workerPort.postMessage({ error });
    } finally {
      Atomics.store(semaphore, 0, 1);
      Atomics.notify(semaphore, 0, 1);
    }
  });
}
function makeSynchronous(function_) {
  let cache;
  function createWorker() {
    if (!cache) {
      const { port1: mainThreadPort, port2: workerPort } = new MessageChannel();
      mainThreadPort.unref();
      workerPort.unref();
      const code = `
        (async() => {
          const { default: setupWorker } = await import(${JSON.stringify(import.meta.url)});
          setupWorker(${function_});
        })();
			`;
      const worker = new Worker(code, {
        eval: true,
        workerData: { workerPort, [IS_WORKER_MARK]: true },
        transferList: [workerPort],
        type: "module",
        hasSourceCode: true,
      });
      worker.unref();
      cache = { worker, mainThreadPort };
    }
    return cache;
  }
  return (...arguments_) => {
    const { worker, mainThreadPort } = createWorker();
    const semaphore = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
    worker.postMessage({ arguments_, semaphore });
    Atomics.wait(semaphore, 0, 0);
    const { error, result } = receiveMessageOnPort(mainThreadPort).message;
    if (error) {
      throw error;
    }
    return result;
  };
}
var exportedValue = IS_WORKER ? setupWorker : makeSynchronous;
var make_synchronous_default = exportedValue;
export { make_synchronous_default as default };
