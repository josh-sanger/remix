function createMockFn(impl) {
    let original = impl;
    let implementation = impl;
    let overrides = new Map();
    let fn = function (...args) {
        let index = fn.mock.calls.length;
        let current = overrides.get(index) ?? implementation;
        overrides.delete(index);
        let call = { arguments: args };
        fn.mock.calls.push(call);
        if (current) {
            try {
                let result = current.apply(this, args);
                call.result = result;
                return result;
            }
            catch (error) {
                call.error = error;
                throw error;
            }
        }
        return undefined;
    };
    fn.mock = {
        calls: [],
        mockImplementation(value) {
            if (typeof value !== 'function')
                throw new TypeError('implementation must be a function');
            implementation = value;
        },
        mockImplementationOnce(value, onCall) {
            if (typeof value !== 'function')
                throw new TypeError('implementation must be a function');
            let index = onCall ?? fn.mock.calls.length;
            if (!Number.isSafeInteger(index) || index < fn.mock.calls.length) {
                throw new RangeError('onCall must be a safe integer at or after the next call index');
            }
            overrides.set(index, value);
        },
        resetCalls() {
            fn.mock.calls = [];
        },
        callCount() {
            return fn.mock.calls.length;
        },
        restore() {
            implementation = original;
        },
    };
    return fn;
}
const methodRestorations = new WeakMap();
function createMethodMock(obj, method, impl) {
    let original = obj[method];
    let descriptor = Object.getOwnPropertyDescriptor(obj, method);
    // Initial overrides retain the existing permissive behavior, including absent methods.
    let mockFn = createMockFn((impl ?? original));
    if (!Reflect.set(obj, method, mockFn))
        throw new TypeError('Unable to mock the method');
    let restoration = {
        object: obj,
        method,
        original,
        descriptor,
        restored: false,
    };
    methodRestorations.set(mockFn, restoration);
    mockFn.mock.restore = () => {
        let target = restoration;
        // A nested mock must not reinstall a spy that was manually restored earlier.
        while (typeof target.original === 'function') {
            let previous = methodRestorations.get(target.original);
            if (!previous?.restored || previous.object !== obj || previous.method !== method)
                break;
            target = previous;
        }
        if (target.descriptor) {
            Object.defineProperty(obj, method, target.descriptor);
        }
        if (!target.descriptor || !('value' in target.descriptor)) {
            if (!Reflect.set(obj, method, target.original)) {
                throw new TypeError('Unable to restore the method');
            }
        }
        restoration.restored = true;
    };
    return mockFn;
}
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
export const mock = {
    /**
     * Creates a mock function that records every call. If `impl` is provided it
     * is used as the underlying implementation; otherwise the mock returns
     * `undefined`.
     */
    fn: createMockFn,
    /**
     * Replaces `obj[methodName]` with a mock and records every call. The
     * original method is used as the implementation unless `impl` is provided.
     * Call `mockFn.mock.restore()` to revert.
     */
    method: createMethodMock,
};
