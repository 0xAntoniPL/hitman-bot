'use strict'

const test = require('@pre-bundled/tape')

const { MultiError, errorf, WError } = require('../index.js')

test('a MultiError', function t (assert) {
  class FanoutError extends MultiError {}

  const error1 = FanoutError.errorFromList([])
  assert.equal(error1, null)

  const tempError = errorf('one error')
  const error2 = FanoutError.errorFromList([tempError])
  assert.ok(error2)
  assert.equal(error2, tempError)
  assert.equal(error2 && error2.message, 'one error')

  const error3 = new MultiError([tempError])
  assert.ok(error3)
  assert.notEqual(error3, tempError)
  assert.equal(error3.message, 'First of 1 error: one error')
  assert.deepEqual(error3.errors(), [tempError])
  assert.equal(error3.name, 'MultiError')
  assert.equal(error3.type, 'multi.error--structured.error')

  assert.equal(JSON.stringify(error3), JSON.stringify({
    message: 'First of 1 error: one error',
    stack: error3.stack,
    type: 'multi.error--structured.error',
    name: 'MultiError',
    errors: [{
      message: 'one error',
      type: 'structured.error',
      name: 'StructuredError'
    }]
  }))

  class LevelReadError extends WError {}

  const dbErr1 = new Error('DB not open')
  const dbErr2 = new Error('DB already closed')

  const wErr1 = LevelReadError.wrap(
    'could not read key: {key}', dbErr1, {
      key: 'foo'
    }
  )
  const wErr2 = LevelReadError.wrap(
    'could not read key: {key}', dbErr2, {
      key: 'bar'
    }
  )

  const error4 = /** @type {MultiError} */
    (FanoutError.errorFromList([wErr1, wErr2]))

  assert.ok(error4)
  assert.equal(error4.message,
    'First of 2 errors: could not read key: foo: DB not open')
  assert.deepEqual(error4.errors(), [wErr1, wErr2])
  assert.equal(error4.name, 'FanoutError')
  assert.equal(error4.type, 'fanout.error--level.read.error')

  assert.equal(JSON.stringify(error4), JSON.stringify({
    message: 'First of 2 errors: could not read key: foo: ' +
      'DB not open',
    stack: error4.stack,
    type: 'fanout.error--level.read.error',
    name: 'FanoutError',
    errors: [{
      key: 'foo',
      message: 'could not read key: foo: DB not open',
      type: 'level.read.error',
      fullType: 'level.read.error~!~error.wrapped-unknown',
      name: 'LevelReadError',
      cause: {
        message: 'DB not open',
        type: 'error',
        name: 'Error'
      }
    }, {
      key: 'bar',
      message: 'could not read key: bar: DB already closed',
      type: 'level.read.error',
      fullType: 'level.read.error~!~error.wrapped-unknown',
      name: 'LevelReadError',
      cause: {
        message: 'DB already closed',
        type: 'error',
        name: 'Error'
      }
    }]
  }))

  assert.end()
})
