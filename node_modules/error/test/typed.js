'use strict'

const test = require('@pre-bundled/tape')

const { SError } = require('../index.js')

test('a server error', function t (assert) {
  class Server5XXError extends SError {}
  const error = Server5XXError.create(
    '{title} server error, status={statusCode}', {
      title: 'some title',
      statusCode: 500
    }
  )

  assert.equal(Server5XXError.type, 'server.5xx.error')

  assert.equal(error.type, 'server.5xx.error')
  assert.deepEqual(error.info(), {
    statusCode: 500,
    title: 'some title'
  })
  assert.equal(error.message, 'some title server error, status=500')
  assert.equal(error.toString(),
    'Server5XXError: some title server error, status=500')

  assert.deepEqual(error.info(), {
    title: 'some title',
    statusCode: 500
  })
  assert.deepEqual(error.toJSON(), {
    message: error.message,
    name: error.name,
    stack: error.stack,
    title: 'some title',
    statusCode: 500,
    type: error.type
  })

  assert.end()
})

test('null fields', function t (assert) {
  class NullError extends SError {}

  const e = NullError.create('myError', {
    length: 'foo',
    buffer: null,
    state: null,
    expecting: null
  })
  assert.equal(e.type, 'null.error')
  assert.equal(NullError.type, 'null.error')

  assert.end()
})

test('a client error', function t (assert) {
  class Client4XXError extends SError {}

  const error2 = Client4XXError.create(
    '{title} client error, status={statusCode}', {
      title: 'some title',
      statusCode: 404
    }
  )

  assert.equal(error2.type, 'client.4xx.error')
  assert.deepEqual(error2.info(), {
    statusCode: 404,
    title: 'some title'
  })
  assert.equal(error2.message, 'some title client error, status=404')
  assert.equal(error2.toString(),
    'Client4XXError: some title client error, status=404')

  assert.deepEqual(error2.info(), {
    title: 'some title',
    statusCode: 404
  })
  assert.deepEqual(error2.toJSON(), {
    message: error2.message,
    name: error2.name,
    stack: error2.stack,
    title: 'some title',
    statusCode: 404,
    type: error2.type
  })

  assert.end()
})
