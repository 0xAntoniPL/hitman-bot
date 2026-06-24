# error

Wrap errors with more context.

## Inspiration

This module is inspired by the go error libraries that have simple
functions for creating & wrapping errors.

This is based on libraries like [eris][eris] & [pkg/errors][pkg-errors]

## Older version of `error`

If you are looking for the older v7 version of error you should
check [v7.x][7.x] branch

## Using `error` with `async` / `await`

Check out [`resultify`](https://www.npmjs.com/package/resultify) !

The rest of the examples use plain vanilla callbacks.

## Motivation

Wrapping errors when bubbling up instead of just doing
`if (err) return cb(err)` allows you to pass more context
up the stack.

Common example include passing along parameters from the DB
read related to the failure or passing along any context
from the user in a HTTP request when doing a failure.

This can give you nice to read messages that include more
information about the failure as it bubbles up.

There is more information about how to handle errors in this
article [Don't just check errors, handle them gracefully][dave]

If you want a deep dive into the difference between
[Programming and Operational errors](https://www.joyent.com/node-js/production/design/errors)
please check out [this guide](https://www.joyent.com/node-js/production/design/errors)

examples:

```js
const { wrapf } = require('error')

function authenticatRequest(req) {
  authenticate(req.user, (err) => {
    if (err) {
      return cb(wrapf('authenticate failed', err))
    }
    cb(null)
  })
}
```

or

```js
const { wrapf } = require('error')

function readFile(path, cb) {
  fs.open(path, 'r', (err, fd) => {
    if (err) {
      return cb(wrapf('open failed', err, { path }))
    }

    const buf = Buffer.alloc(64 * 1024)
    fs.read(fd, buf, 0, buf.length, 0, (err) => {
      if (err) {
        return cb(wrapf('read failed', err, { path }))
      }

      fs.close(fd, (err) => {
        if (err) {
          return cb(wrapf('close failed', err, { path }))
        }

        cb(null, buf)
      })
    })
  })
}
```

## Structured errors

```js
const { SError } = require('error')

class ServerError extends SError {}
class ClientError extends SError {}

const err = ServerError.create(
  '{title} server error, status={statusCode}', {
    title: 'some title',
    statusCode: 500
  }
)
const err2 = ClientError.create(
  '{title} client error, status={statusCode}', {
    title: 'some title',
    statusCode: 404
  }
)
```

## Wrapped Errors

```js
const net = require('net');
const { WError } = require('error')

class ServerListenError extends WError {}

var server = net.createServer();

server.on('error', function onError(err) {
  if (err.code === 'EADDRINUSE') {
    throw ServerListenFailedError.wrap(
      'error in server, on port={requestPort}', err, {
        requestPort: 3000,
        host: null
      }
    )
  } else {
    throw err;
  }
});

server.listen(3000);
```

## Comparison to Alternatives.

There are alternative existing libraries for creating typed
and wrapped errors on npm. Here's a quick comparison to some
alternatives.

### [`verror`][verror]

This module takes inspiration from `verror` and adds improvements.
 - You can pass extra fields as meta data on the error
 - The templating forces dynamic strings to be extra fields.
 - Uses ES6 classes for inheritance. This gives your errors unique
class names and makes them show up in heapdumps.
 - Has JSON.stringify support

### [`error@7.x`][7.x]

This package used to have a completely different API on the
[7.x][7.x] branch.
 - New `error` module uses actual classes instead of dynamically
monkey patching fields onto `new Error()`
 - Implementation is more static, previous code was very dynamic
 - Simpler API, see the message & properties in one place.
 - `wrapf` & `errorf` helpers for less boilerplate.

### Hand writing `Error` sub classes.

You can create your own Error classes by hand. This tends to lead
to 10-20 lines of boilerplate per error which is replace with
one line by using the `error` module; aka

```js
class AccountsServerFailureError extends SError {}
class ConnectionResetError extends WError {}
```

### [`ono`][ono]

The `ono` package has similar functionality with a different API
 - `ono` encourages plain errors instead of custom errors by default
 - `error` has zero dependencies
 - `error` is only one simple file. `ono` is 10.
 - `error` implementation is more static, ono is very dynamic.

## Documentation

This package implements three classes, `WError`; `SError` &
`MultiError`

You are expected to subclass either `WError` or `SError`;

 - `SError` stands for `Structured Error`; it's an error base
    class for adding informational fields to your error beyond
    just having a message.
 - `WError` stands for `Wrapped Error`; it's an error base
    class for when you are wrapping an existing error with more
    information.

The `MultiError` class exists to store an array of errors but
still return a single `Error`; This is useful if your doing
a parallel operation and you want to wait for them all to finish
and do something with all of the failures.

Some utility functions are also exported:
 - `findCauseByName`; See if error or any of it's causes is of
the type name.
 - `fullStack`; Take a wrapped error and compute a full stack.
 - `wrapf`; Utility function to quickly wrap
 - `errorf`; Utility function to quickly create an error
 - `getInfo`; Utility function to get the info for any error
object. Calls `err.info()` if the method exists.

### `WError`

Example:

```js
class ServerListenError extends WError {}

ServerListenError.wrap('error in server', err, {
  port: 3000
})
```

When using the `WError` class it's recommended to always call
the static `wrap()` method instead of calling the constructor
directly.

Example (without cause message):

```js
class ApplicationStartupError extends WError {}

ApplicationStartupError.wrap(
  'Could not start the application cleanly: {reason}',
  err,
  {
    skipCauseMessage: true,
    reason: 'Failed to read from disk'
  }
)
```

Setting `skipCauseMessage: true` will not append the cause
error message but still make the cause object available.

### `const werr = new WError(message, cause, info)`

Internal constructor, should pass a `message` string, a `cause`
error and a `info` object (or `null`).

### `WError.wrap(msgTmpl, cause, info)`

`wrap()` method to create error instances. This applies the
[`string-template`][string-template] templating to `msgTmpl`
with `info` as a parameter.

The `cause` parameter must be an `error`
The `info` parameter is an object or `null`.

The `info` parameter can contain the field `skipCauseMessage: true`
which will make `WError` not append `: ${causeMessage}` to the
message of the error.

### `werr.type`

The `type` field is the machine readable type for this error.
Always use `err.type` and never `err.message` when trying to
determine what kind of error it is.

The `type` field is unlikely to change but the `message` field
can change.

### `werr.fullType()`

Calling `fullType` will compute a full type for this error and
any causes that it wraps. This gives you a long `type` string
that's a concat for every wrapped cause.

### `werr.cause()`

Returns the `cause` error.

### `werr.info()`

Returns the `info` object passed on. This is merged with the
info of all `cause` errors up the chain.

### `werr.toJSON()`

The `WError` class implements `toJSON()` so that the JSON
serialization makes sense.

### `WError.fullStack(err)`

This returns a full stack; which is a concatenation of this
stack trace and the stack trace of all causes in the cause chain

### `WError.findCauseByName(err, name)`

Given an err and a name will find if the err or any causes
implement the type of that name.

This allows you to check if a wrapped `ApplicationError` has
for example a `LevelReadError` or `LevelWriteError` in it's cause
chain and handle database errors differently from all other app
errors.

### `SError`

Example:

```js
class LevelReadError extends SError {}

LevelReadError.create('Could not read key: {key}', {
  key: '/some/key'
})
```

When using the `SError` class it's recommended to always call
the static `create()` method instead of calling the constructor
directly.

### `const serr = new SError(message, info)`

Internal constructor that takes a message string & an info object.

### `SError.create(messageTmpl, info)`

The main way to create error objects, takes a message template
and an info object.

It will use [string-template][string-template] to apply the
template with the `info` object as a parameter.

### `SError.getInfo(error)`

Static method to `getInfo` on a maybe error. The `error` can
be `null` or `undefined`, it can be a plain `new Error()` or
it can be a structured or wrapped error.

Will return `err.info()` if it exists, returns `{}` if its `null`
and returns `{ ...err }` if its a plain vanilla error.

### `serr.type`

Returns the type field. The `err.type` field is machine readable.
Always use `err.type` & not `err.message` when trying to compare
errors or do any introspection.

The `type` field is unlikely to change but the `message` field
can change.

### `serr.info()`

Returns the info object for this error.

### `serr.toJSON()`

This class can JSON serialize cleanly.

### `MultiError`

Example:

```js
class FanoutError extends MultiError {}

function doStuff (filePath, cb) {
  fanoutDiskReads(filePath, (errors, fileContents) => {
    if (errors && errors.length > 0) {
      const err = FanoutError.errorFromList(errors)
      return cb(err)
    }

    // do stuff with files.
  })
}
```

When using the `MultiError` class it's recommended to always
call the static `errorFromList` method instead of calling the
constructor directly.

## Usage from typescript

The `error` library does not have an `index.d.ts` but does have
full `jsdoc` annotations so it should be typesafe to use.

You will need to configure your `tsconfig` appropiately ...

```json
{
  "compilerOptions": {
    ...
    "allowJs": true,
    ...
  },
  "include": [
    "src/**/*.js",
    "node_modules/error/index.js"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

Typescript does not understand well type source code in
`node_modules` without an `index.d.ts` by default, so you
need to tell it to include the implementation of `error/index.js`
during type checking and to `allowJs` to enable typechecking
js + jsdoc comments.

## Installation

`npm install error`

## Contributors

 - Raynos

## MIT Licenced

  [eris]: https://github.com/rotisserie/eris/tree/v0.1.0
  [pkg-errors]: https://github.com/pkg/errors
  [7.x]: https://github.com/Raynos/error/tree/v7.x
  [dave]: https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully
  [string-template]: https://github.com/Matt-Esch/string-template
  [verror]: https://github.com/joyent/node-verror
  [ono]: https://github.com/JS-DevTools/ono
