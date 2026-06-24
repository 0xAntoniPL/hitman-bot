// Type definitions for 'mock-stdin'
// Project: mock-stdin
// Definitions by: Ron S. http://github.com/nonara

interface MockSTDIN {
  /** Queue up data to be read by the stream. Results in data (and possibly end) events being dispatched. */
  send: (data: String | Buffer | string[] | null, encoding?: string) => MockSTDIN
  /** Alias for MockSTDIN.send(null). Results in dispatching an end event. */
  end: () => MockSTDIN
  /** Restore the target of the mocked stream. If only a single mock stream is created, will restore the original stdin TTY stream. If multiple mock streams are created, it will restore the stream which was active at the time the mock was created. */
  restore: () => MockSTDIN
  /**
   * Ordinarily, a Readable stream will throw when attempting to push after an EOF. This routine will reset the ended state of a Readable stream, preventing it from throwing post-EOF. This prevents being required to re-create a mock STDIN instance during certain tests where a fresh stdin is required.
   * @param removeListeners - When set to true, will remove all event listeners attached to the stream.
   */
  reset: (removeListeners?: boolean) => MockSTDIN
}

/**
 * Replaces the existing process.stdin value with a mock object exposing a send method (a MockSTDIN instance). This allows APIs like process.openStdin() or process.stdin.on() to operate on a mock instance.
 *
 * - Note: Event listeners from the original process.stdin instance are not added to the mock instance. Installation of the mock should occur before any event listeners are registered.
 */
export function stdin(): MockSTDIN