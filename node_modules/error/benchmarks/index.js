'use strict'

/**
 * Micro benchmark
 */
const { WError, SError } = require('../index')

const TypedError = require(
  './multidep_modules/error-7.2.1/node_modules/error/typed'
)
const WrappedError = require(
  './multidep_modules/error-7.2.1/node_modules/error/wrapped'
)

const WARMUP_LOOP = 5000
const RUN_LOOP = 250 * 1000

let mode = process.argv[2]
if (!mode) {
  mode = 'alloc'
}

console.log('Running benchmarks', mode)

class ServerError extends SError {}
class ServerListenError extends WError {}

const ServerTypedError = TypedError({
  type: 'server.5xx',
  message: '{title} server error, status={statusCode}',
  title: null,
  statusCode: null
})

const ServerListenWrappedError = WrappedError({
  message: 'server: {origMessage}',
  type: 'server.listen-failed',
  requestedPort: null,
  host: null
})

const out = {
  result: null
}

if (mode === 'alloc') {
  allocTypedError(WARMUP_LOOP)
  console.log('allocTypedError', allocTypedError(RUN_LOOP))

  allocWrappedError(WARMUP_LOOP)
  console.log('allocWrappedError', allocWrappedError(RUN_LOOP))

  allocSError(WARMUP_LOOP)
  console.log('allocSError', allocSError(RUN_LOOP))

  allocWError(WARMUP_LOOP)
  console.log('allocWError', allocWError(RUN_LOOP))
} else if (mode === 'stringify') {
  stringifyTypedError(WARMUP_LOOP)
  console.log('stringifyTypedError', stringifyTypedError(RUN_LOOP))

  stringifyWrappedError(WARMUP_LOOP)
  console.log('stringifyWrappedError', stringifyWrappedError(RUN_LOOP))

  stringifySError(WARMUP_LOOP)
  console.log('stringifySError', stringifySError(RUN_LOOP))

  stringifyWError(WARMUP_LOOP)
  console.log('stringifyWError', stringifyWError(RUN_LOOP))
}

function allocTypedError (count) {
  const start = Date.now()
  for (let i = 0; i < count; i++) {
    out.result = ServerTypedError({
      title: 'some title',
      statusCode: 500
    })
  }
  return Date.now() - start
}
function stringifyTypedError (count) {
  const start = Date.now()
  const err = ServerTypedError({
    title: 'some title',
    statusCode: 500
  })
  Object.defineProperty(err, 'stack', {
    enumerable: true,
    configurable: true
  })
  for (let i = 0; i < count; i++) {
    out.result = JSON.stringify(err)
  }
  return Date.now() - start
}

function allocWrappedError (count) {
  const start = Date.now()
  for (let i = 0; i < count; i++) {
    out.result = ServerListenWrappedError(
      new Error('EADDRINUSE'), {
        requestedPort: 3000,
        host: 'localhost'
      }
    )
  }
  return Date.now() - start
}
function stringifyWrappedError (count) {
  const start = Date.now()
  const err = ServerListenWrappedError(
    new Error('EADDRINUSE'), {
      requestedPort: 3000,
      host: 'localhost'
    }
  )
  Object.defineProperty(err, 'stack', {
    enumerable: true,
    configurable: true
  })
  for (let i = 0; i < count; i++) {
    out.result = JSON.stringify(err)
  }
  return Date.now() - start
}

function allocSError (count) {
  const start = Date.now()
  for (let i = 0; i < count; i++) {
    out.result = ServerError.create(
      '{title} server error, status={statusCode}', {
        title: 'some title',
        statusCode: 500
      }
    )
  }
  return Date.now() - start
}
function stringifySError (count) {
  const start = Date.now()
  const err = ServerError.create(
    '{title} server error, status={statusCode}', {
      title: 'some title',
      statusCode: 500
    }
  )
  for (let i = 0; i < count; i++) {
    out.result = JSON.stringify(err)
  }
  return Date.now() - start
}

function allocWError (count) {
  const start = Date.now()
  for (let i = 0; i < count; i++) {
    out.result = ServerListenError.wrap(
      'server', new Error('EADDRINUSE'), {
        title: 'some title',
        statusCode: 500
      }
    )
  }
  return Date.now() - start
}
function stringifyWError (count) {
  const start = Date.now()
  const err = ServerListenError.wrap(
    'server', new Error('EADDRINUSE'), {
      title: 'some title',
      statusCode: 500
    }
  )
  for (let i = 0; i < count; i++) {
    out.result = JSON.stringify(err)
  }
  return Date.now() - start
}
