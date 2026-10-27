/** Records the arguments, return value, and any thrown error for a single call. */
export interface MockCall<Args extends unknown[] = unknown[], Result = unknown> {
    /** Arguments supplied to this call. */
    arguments: Args;
    /** The returned value, including an unawaited promise for async calls. */
    result?: Result;
    /** The value thrown synchronously by this call. */
    error?: unknown;
}
/**
 * Metadata attached to every mock/spy function via its `.mock` property.
 * Calls are recorded before the implementation runs, including reentrant calls.
 */
export interface MockContext<Args extends unknown[] = unknown[], Result = unknown, receiver = unknown> {
    /** Live call history. `resetCalls()` replaces this array with a fresh one. */
    calls: MockCall<Args, Result>[];
    /**
     * Changes the default implementation without clearing scheduled overrides.
     * @param implementation The replacement implementation.
     */
    mockImplementation(implementation: (this: receiver, ...args: Args) => Result): void;
    /**
     * Replaces the implementation for one call, replacing any override at that index.
     * @param implementation The replacement implementation.
     * @param onCall Zero-based call index, which must not have passed (defaults to the next call).
     */
    mockImplementationOnce(implementation: (this: receiver, ...args: Args) => Result, onCall?: number): void;
    /** Clears call history and resets indices without changing implementations or pending overrides. */
    resetCalls(): void;
    /**
     * Counts calls in the current history.
     * @returns The number of recorded calls.
     */
    callCount(): number;
    /**
     * Restores a method's original value and any own descriptor, or a standalone mock's original default.
     * Retains call history and pending overrides; retained method spies remain callable.
     */
    restore(): void;
}
/** A function augmented with a `.mock` property for inspecting recorded calls. */
export type MockFunction<T extends (...args: any[]) => any = (...args: any[]) => any> = T & {
    /** Call history and implementation controls for this function. */
    mock: MockContext<Parameters<T>, ReturnType<T>, ThisParameterType<T>>;
};
declare function createMockFn<T extends (...args: any[]) => any>(impl?: T): MockFunction<T>;
type Method<target, key extends keyof target> = [
    Extract<target[key], (...args: never[]) => unknown>
] extends [never] ? (...args: any[]) => any : Extract<target[key], (...args: never[]) => unknown>;
type MethodMock<method extends (...args: any[]) => any> = ((...args: any[]) => any) & {
    mock: Omit<MockFunction['mock'], 'mockImplementation' | 'mockImplementationOnce'> & Pick<MockContext<Parameters<method>, ReturnType<method>, ThisParameterType<method>>, 'mockImplementation' | 'mockImplementationOnce'>;
};
declare function createMethodMock<T extends object, K extends keyof T>(obj: T, method: K, impl?: T[K] extends (...args: any[]) => any ? (...args: Parameters<T[K]>) => any : never): MethodMock<Method<T, K>>;
/**
 * Utilities for creating mock functions and method spies. Mirrors the names
 * on Node.js's built-in `MockTracker` from `node:test`.
 *
 * @example
 * // Standalone mock
 * const fn = mock.fn((x: number) => x * 2)
 * fn(3)
 * assert.equal(fn.mock.calls[0].result, 6)
 *
 * // Mock an existing method
 * const spy = mock.method(console, 'log')
 * console.log('hello')
 * assert.equal(spy.mock.calls.length, 1)
 * spy.mock.restore()
 */
export declare const mock: {
    /**
     * Creates a mock function that records every call. If `impl` is provided it
     * is used as the underlying implementation; otherwise the mock returns
     * `undefined`.
     */
    fn: typeof createMockFn;
    /**
     * Replaces `obj[methodName]` with a mock and records every call. The
     * original method is used as the implementation unless `impl` is provided.
     * Call `mockFn.mock.restore()` to revert.
     */
    method: typeof createMethodMock;
};
export {};
//# sourceMappingURL=mock.d.ts.map