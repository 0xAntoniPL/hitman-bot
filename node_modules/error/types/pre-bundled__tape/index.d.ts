// TypeScript Version: 3.0
/// <reference types="node" />

export = tape;

/**
 * Create a new test with an optional name string and optional opts object.
 * cb(t) fires with the new test object t once all preceeding tests have finished.
 * Tests execute serially.
 */
declare function tape(name: string | tape.TestOptions, cb: tape.TestCase): void;
declare function tape(name: string, opts: tape.TestOptions, cb: tape.TestCase): void;
declare function tape(cb: tape.TestCase): void;

declare namespace tape {
    interface TestCase {
        (test: Test): void;
    }

    /**
     * Available opts options for the tape function.
     */
    interface TestOptions {
        skip?: boolean;		// See tape.skip.
        timeout?: number;	// Set a timeout for the test, after which it will fail. See tape.timeoutAfter.
    }

    /**
     * Options for the createStream function.
     */
    interface StreamOptions {
        objectMode?: boolean;
    }

    /**
     * Generate a new test that will be skipped over.
     */
    function skip(name: string | TestOptions, cb: TestCase): void;
    function skip(name: string): void;
    function skip(name: string, opts: TestOptions, cb: TestCase): void;
    function skip(cb: TestCase): void;

    /**
     * The onFinish hook will get invoked when ALL tape tests have finished right before tape is about to print the test summary.
     */
    function onFinish(cb: () => void): void;

    /**
     * Like test(name?, opts?, cb) except if you use .only this is the only test case that will run for the entire process, all other test cases using tape will be ignored.
     */
    function only(name: string | TestOptions, cb: TestCase): void;
    function only(name: string, opts: TestOptions, cb: TestCase): void;
    function only(cb: TestCase): void;

    /**
     * Create a new test harness instance, which is a function like test(), but with a new pending stack and test state.
     */
    function createHarness(): typeof tape;
    /**
     * Create a stream of output, bypassing the default output stream that writes messages to console.log().
     * By default stream will be a text stream of TAP output, but you can get an object stream instead by setting opts.objectMode to true.
     */
    function createStream(opts?: StreamOptions): NodeJS.ReadableStream;

    interface Test {
        /**
         * Create a subtest with a new test handle st from cb(st) inside the current test.
         * cb(st) will only fire when t finishes.
         * Additional tests queued up after t will not be run until all subtests finish.
         */
        test(name: string, cb: TestCase): void;
        test(name: string, opts: TestOptions, cb: TestCase): void;

        /**
         * Declare that n assertions should be run. end() will be called automatically after the nth assertion.
         * If there are any more assertions after the nth, or after end() is called, they will generate errors.
         */
        plan(n: number): void;

        /**
         * Declare the end of a test explicitly.
         * If err is passed in t.end will assert that it is falsey.
         */
        end(err?: unknown): void;

        /**
         * Generate a failing assertion with a message msg.
         */
        fail(msg?: string): void;

        /**
         * Generate a passing assertion with a message msg.
         */
        pass(msg?: string): void;

        /**
         * Automatically timeout the test after X ms.
         */
        timeoutAfter(ms: number): void;

        /**
         * Generate an assertion that will be skipped over.
         */
        skip(msg?: string): void;

        /**
         * Assert that value is truthy with an optional description message msg.
         */
        ok(value: unknown, msg?: string): void;
        true(value: unknown, msg?: string): void;
        assert(value: unknown, msg?: string): void;

        /**
         * Assert that value is falsy with an optional description message msg.
         */
        notOk(value: unknown, msg?: string): void;
        false(value: unknown, msg?: string): void;
        notok(value: unknown, msg?: string): void;

        /**
         * Assert that err is falsy.
         * If err is non-falsy, use its err.message as the description message.
         */
        error(err: unknown, msg?: string): void;
        ifError(err: unknown, msg?: string): void;
        ifErr(err: unknown, msg?: string): void;
        iferror(err: unknown, msg?: string): void;

        /**
         * Assert that a === b with an optional description msg.
         */
        equal<T>(actual: T, expected: T, msg?: string): void;
        equals<T>(actual: T, expected: T, msg?: string): void;
        isEqual<T>(actual: T, expected: T, msg?: string): void;
        is<T>(actual: T, expected: T, msg?: string): void;
        strictEqual<T>(actual: T, expected: T, msg?: string): void;
        strictEquals<T>(actual: T, expected: T, msg?: string): void;

        /**
         * Assert that a !== b with an optional description msg.
         */
        notEqual(actual: unknown, expected: unknown, msg?: string): void;
        notEquals(actual: unknown, expected: unknown, msg?: string): void;
        notStrictEqual(actual: unknown, expected: unknown, msg?: string): void;
        notStrictEquals(actual: unknown, expected: unknown, msg?: string): void;
        isNotEqual(actual: unknown, expected: unknown, msg?: string): void;
        isNot(actual: unknown, expected: unknown, msg?: string): void;
        not(actual: unknown, expected: unknown, msg?: string): void;
        doesNotEqual(actual: unknown, expected: unknown, msg?: string): void;
        isInequal(actual: unknown, expected: unknown, msg?: string): void;

        /**
         * Assert that a and b have the same structure and nested values using node's deepEqual() algorithm with strict comparisons (===) on leaf nodes and an optional description msg.
         */
        deepEqual<T>(actual: T, expected: T, msg?: string): void;
        deepEquals<T>(actual: T, expected: T, msg?: string): void;
        isEquivalent<T>(actual: T, expected: T, msg?: string): void;
        same<T>(actual: T, expected: T, msg?: string): void;

        /**
         * Assert that a and b do not have the same structure and nested values using node's deepEqual() algorithm with strict comparisons (===) on leaf nodes and an optional description msg.
         */
        notDeepEqual(actual: unknown, expected: unknown, msg?: string): void;
        notEquivalent(actual: unknown, expected: unknown, msg?: string): void;
        notDeeply(actual: unknown, expected: unknown, msg?: string): void;
        notSame(actual: unknown, expected: unknown, msg?: string): void;
        isNotDeepEqual(actual: unknown, expected: unknown, msg?: string): void;
        isNotDeeply(actual: unknown, expected: unknown, msg?: string): void;
        isNotEquivalent(actual: unknown, expected: unknown, msg?: string): void;
        isInequivalent(actual: unknown, expected: unknown, msg?: string): void;

        /**
         * Assert that a and b have the same structure and nested values using node's deepEqual() algorithm with loose comparisons (==) on leaf nodes and an optional description msg.
         */
        deepLooseEqual(actual: unknown, expected: unknown, msg?: string): void;
        looseEqual(actual: unknown, expected: unknown, msg?: string): void;
        looseEquals(actual: unknown, expected: unknown, msg?: string): void;

        /**
         * Assert that a and b do not have the same structure and nested values using node's deepEqual() algorithm with loose comparisons (==) on leaf nodes and an optional description msg.
         */
        notDeepLooseEqual(actual: unknown, expected: unknown, msg?: string): void;
        notLooseEqual(actual: unknown, expected: unknown, msg?: string): void;
        notLooseEquals(actual: unknown, expected: unknown, msg?: string): void;

        /**
         * Assert that the function call fn() throws an exception.
         * expected, if present, must be a RegExp or Function, which is used to test the exception object.
         */
        throws(fn: () => void, msg?: string): void;
        throws(fn: () => void, exceptionExpected: RegExp | typeof Error, msg?: string): void;

        /**
         * Assert that the function call fn() does not throw an exception.
         */
        doesNotThrow(fn: () => void, msg?: string): void;
        doesNotThrow(fn: () => void, exceptionExpected: RegExp | typeof Error, msg?: string): void;

        /**
         * Print a message without breaking the tap output.
         * (Useful when using e.g. tap-colorize where output is buffered & console.log will print in incorrect order vis-a-vis tap output.)
         */
        comment(msg: string): void;
    }
}
