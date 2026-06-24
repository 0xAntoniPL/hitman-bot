'use strict'

const test = require('@pre-bundled/tape')
const net = require('net')

const { WError, getTypeName } = require('../index.js')

/** @type {(o: object, k: string) => unknown} */
const reflectGet = Reflect.get

test('can create a wrapped error', function t (assert) {
  class ServerListenFailedError extends WError {}

  /** @type {Error & { code?: string }} */
  const err = new Error('listen EADDRINUSE')
  err.code = 'EADDRINUSE'

  const err2 = ServerListenFailedError.wrap(
    'server failed', err, {
      requestedPort: 3426,
      host: 'localhost'
    }
  )

  assert.equal(
    ServerListenFailedError.type,
    'server.listen.failed.error'
  )

  assert.equal(err2.message, 'server failed: listen EADDRINUSE')
  assert.deepEqual(err2.info(), {
    requestedPort: 3426,
    host: 'localhost',
    code: 'EADDRINUSE'
  })

  assert.equal(err2.cause(), err)

  assert.equal(err2.toString(),
    'ServerListenFailedError: server failed: listen EADDRINUSE')

  assert.equal(JSON.stringify(err2), JSON.stringify({
    code: 'EADDRINUSE',
    requestedPort: 3426,
    host: 'localhost',
    message: 'server failed: listen EADDRINUSE',
    stack: err2.stack,
    type: 'server.listen.failed.error',
    fullType: 'server.listen.failed.error~!~' +
      'error.wrapped-unknown',
    name: 'ServerListenFailedError',
    cause: {
      code: err.code,
      message: err.message,
      type: 'error',
      name: err.name
    }
  }))

  assert.end()
})

test('can create wrapped error with syscall', function t (assert) {
  class SyscallError extends WError {}

  /** @type {Error & { code?: string, syscall?: string }} */
  const err = new Error('listen EADDRINUSE')
  err.code = 'EADDRINUSE'
  err.syscall = 'listen'

  const err2 = SyscallError.wrap(
    'tchannel socket error ({code} from {syscall})', err
  )

  assert.equal(err2.message, 'tchannel socket error ' +
    '(EADDRINUSE from listen): listen EADDRINUSE')
  assert.deepEqual(err2.info(), {
    syscall: 'listen',
    code: 'EADDRINUSE'
  })
  assert.equal(err2.type, 'syscall.error')

  assert.end()
})

test('wrapping with skipCauseMessage', function t (assert) {
  class SyscallError extends WError {}

  /** @type {Error & { code?: string, syscall?: string }} */
  const err = new Error('listen EADDRINUSE')
  err.code = 'EADDRINUSE'
  err.syscall = 'listen'

  const err2 = SyscallError.wrap(
    'tchannel socket error ({code} from {syscall})', err, {
      skipCauseMessage: true
    }
  )

  assert.equal(err2.message, 'tchannel socket error ' +
    '(EADDRINUSE from listen)')
  assert.deepEqual(err2.info(), {
    syscall: 'listen',
    code: 'EADDRINUSE',
    skipCauseMessage: true
  })
  assert.equal(err2.type, 'syscall.error')

  assert.end()
})

test('wrapping twice', function t (assert) {
  class ReadError extends WError {}
  class DatabaseError extends WError {}
  class BusinessError extends WError {}

  const err = BusinessError.wrap(
    'business', DatabaseError.wrap(
      'db', ReadError.wrap('read', new Error('oops'))
    )
  )
  assert.ok(err)

  assert.equal(err.message, 'business: db: read: oops')
  assert.equal(err.type, 'business.error')
  assert.equal(err.fullType(), 'business.error~!~' +
    'database.error~!~' +
    'read.error~!~' +
    'error.wrapped-unknown')

  assert.equal(JSON.stringify(err), JSON.stringify({
    message: 'business: db: read: oops',
    stack: err.stack,
    type: 'business.error',
    fullType: 'business.error~!~database.error~!~' +
      'read.error~!~error.wrapped-unknown',
    name: 'BusinessError',
    cause: {
      message: 'db: read: oops',
      type: 'database.error',
      fullType: 'database.error~!~' +
        'read.error~!~error.wrapped-unknown',
      name: 'DatabaseError',
      cause: {
        message: 'read: oops',
        type: 'read.error',
        fullType: 'read.error~!~error.wrapped-unknown',
        name: 'ReadError',
        cause: {
          message: 'oops',
          type: 'error',
          name: 'Error'
        }
      }
    }
  }))

  assert.end()
})

test('handles bad recursive strings', function t (assert) {
  class ReadError extends WError {}

  const err2 = ReadError.wrap(
    'read: {code}', new Error('hi'), {
      code: 'extra {code}'
    }
  )

  assert.ok(err2)
  assert.equal(err2.message, 'read: extra {code}: hi')

  assert.end()
})

test('can wrap real IO errors', function t (assert) {
  class ServerListenFailedError extends WError {}

  const otherServer = net.createServer()
  otherServer.once('listening', onPortAllocated)
  otherServer.listen(0)

  /** @returns {void} */
  function onPortAllocated () {
    const addr = /** @type {{port: number}} */ (otherServer.address())
    const port = addr.port

    const server = net.createServer()
    server.on('error', onError)

    server.listen(port)

    /**
     * @param {Error} cause
     * @returns {void}
     */
    function onError (cause) {
      const err = ServerListenFailedError.wrap(
        'server listen failed', cause, {
          host: 'localhost',
          requestedPort: port
        }
      )

      otherServer.close()
      assertOnError(err, cause, port)
    }
  }

  /**
   * @param {ServerListenFailedError} err
   * @param {Error} cause
   * @param {number} port
   * @returns {void}
   */
  function assertOnError (err, cause, port) {
    assert.ok(err.message.indexOf('server listen failed: ') >= 0)
    assert.ok(err.message.indexOf('listen EADDRINUSE') >= 0)
    assert.deepEqual(err.info(), {
      requestedPort: port,
      host: 'localhost',
      code: 'EADDRINUSE',
      syscall: 'listen',
      errno: 'EADDRINUSE'
    })

    assert.equal(err.cause(), cause)

    assert.ok(err.toString().indexOf('ServerListenFailedError: ') >= 0)
    assert.ok(err.toString().indexOf('server listen failed: ') >= 0)
    assert.ok(err.toString().indexOf('listen EADDRINUSE') >= 0)

    assert.equal(JSON.stringify(err), JSON.stringify({
      code: 'EADDRINUSE',
      errno: 'EADDRINUSE',
      syscall: 'listen',
      host: 'localhost',
      requestedPort: port,
      message: err.message,
      stack: err.stack,
      type: 'server.listen.failed.error',
      fullType: 'server.listen.failed.error~!~' +
        'error.wrapped-io.listen.EADDRINUSE',
      name: 'ServerListenFailedError',
      cause: {
        code: 'EADDRINUSE',
        errno: 'EADDRINUSE',
        syscall: 'listen',
        message: err.cause().message,
        type: 'error',
        name: 'Error'
      }
    }))

    assert.end()
  }
})

test('can wrap assert errors', function t (assert) {
  class TestError extends WError {}

  const err = TestError.wrap('error', createAssertionError())
  assert.deepEqual(Reflect.get(err.cause(), 'actual'), 'a')

  if (err.message === "error: 'a' === 'b'") {
    assert.equal(err.message, "error: 'a' === 'b'")
  } else {
    assert.ok(/[eE]xpected /.test(err.message))
    assert.ok(err.message.includes('strictly equal'))
  }

  assert.ok(err.cause().name.includes('AssertionError'))
  const operator = reflectGet(err.info(), 'operator')
  assert.ok(operator === '===' || operator === 'strictEqual')

  assert.equal(JSON.stringify(err), JSON.stringify({
    code: 'ERR_ASSERTION',
    actual: 'a',
    expected: 'b',
    operator: operator,
    message: 'error: ' + err.cause().message,
    stack: err.stack,
    type: 'test.error',
    fullType: 'test.error~!~error.wrapped-unknown',
    name: 'TestError',
    cause: {
      code: 'ERR_ASSERTION',
      actual: 'a',
      expected: 'b',
      operator: reflectGet(err.cause(), 'operator'),
      message: err.cause().message,
      type: getTypeName(err.cause().name),
      name: err.cause().name
    }
  }))

  assert.end()
})

/** @returns {Error} */
function createAssertionError () {
  try {
    require('assert').strictEqual('a', 'b')
    return new Error('never')
  } catch (_err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return /** @type {Error} */ (_err)
  }
}
