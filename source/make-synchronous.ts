// @ts-nocheck
import { parentPort, receiveMessageOnPort, Worker, workerData } from "node:worker_threads";

type AsyncFunction = (...arguments_: any[]) => PromiseLike<unknown>;
type AsyncReturnType<Target extends AsyncFunction> = Awaited<ReturnType<Target>>;

// TODO: Move these to https://github.com/sindresorhus/type-fest
type AnyAsyncFunction = (...argumentsList: any[]) => Promise<unknown | void>;
type ReplaceReturnType<T extends (...arguments_: any) => unknown, NewReturnType> = (
  ...arguments_: Parameters<T>
) => NewReturnType;

/**
 * Returns a wrapped version of the given async function or a string representation to a async function which executes
 * synchronously. This means no other code will execute (not even async code) until the given async function is done.
 *
 * The function is executed in a worker or subprocess, so you cannot access variables or imports from outside its scope.
 * Use `await import(…)` to import dependencies inside the function.
 *
 * Uses [`MessagePort#postMessage()`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) or
 * the V8 serialization API to transfer arguments, return values, errors between the worker or subprocess and the
 * current process. Most values are supported — except functions and symbols.
 *
 * @example
 *
 * ```
 * import makeSynchronous from 'make-synchronous';
 *
 * const fn = makeSynchronous(async number => {
 * 	const {default: delay} = await import('delay');
 *
 * 	await delay(100);
 *
 * 	return number * 2;
 * });
 *
 * console.log(fn(2));
 * //=> 4
 * ```
 *
 * @example
 *
 * ```
 * import makeSynchronous from 'make-synchronous/subprocess';
 *
 * makeSynchronous(async () => {
 * 	// Runs in a subprocess.
 * });
 * ```
 *
 */
export type MakeSynchronous = <T extends AnyAsyncFunction = AnyAsyncFunction>(
  asyncFunction: T | string,
) => ReplaceReturnType<T, AsyncReturnType<T>>;

// Not using `isMainThread` so it can be used in another worker.
const IS_WORKER_MARK = "is-make-synchronous-worker";
const IS_WORKER = workerData?.[IS_WORKER_MARK];

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

const exportedValue = (IS_WORKER ? setupWorker : makeSynchronous) as MakeSynchronous;

export default exportedValue;
