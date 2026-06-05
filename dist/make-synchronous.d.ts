// @ts-nocheck

type AsyncFunction = (...arguments_: any[]) => PromiseLike<unknown>;
type AsyncReturnType<Target extends AsyncFunction> = Awaited<ReturnType<Target>>;
type AnyAsyncFunction = (...argumentsList: any[]) => Promise<unknown | void>;
type ReplaceReturnType<T extends (...arguments_: any) => unknown, NewReturnType> = (
  ...arguments_: Parameters<T>
) => NewReturnType;
/**
 * Returns a wrapped version of the given async function or a string representation to a async function which executes
 * synchronously. This means no other code will execute (not even async code) until the given async function is done.
 *
 * Uses [`MessagePort#postMessage()`](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist)
 * or the V8 serialization API to transfer arguments, return values, errors between the worker or subprocess and the
 * current process. Most values are supported — except functions and symbols.
 *
 * @example
 *
 * ```
 *
 * const fn = makeSynchronous(async number => {
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
const exportedValue: MakeSynchronous;
export default exportedValue;
