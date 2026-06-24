stdout-stderr
=============

mock stdout and stderr

[![Version](https://img.shields.io/npm/v/stdout-stderr.svg)](https://npmjs.org/package/stdout-stderr)
[![Known Vulnerabilities](https://snyk.io/test/npm/stdout-stderr/badge.svg)](https://snyk.io/test/npm/stdout-stderr)
[![Downloads/week](https://img.shields.io/npm/dw/stdout-stderr.svg)](https://npmjs.org/package/stdout-stderr)
[![License](https://img.shields.io/npm/l/stdout-stderr.svg)](https://github.com/jdxcode/stdout-stderr/blob/master/package.json)

**Usage:**

```js
const {stdout, stderr} = require('stdout-stderr')

stdout.start()                                // start mocking stdout
console.log('writing to stdout')              // this will not be displayed
stdout.stop()                                 // stop mocking stdout
assert(stdout.output === 'writing to stdout') // view the output


/* options */
stdout.stripColor = false // disable automatic ansi code stripping
stdout.print = true       // also output to screen
```

This uses the [debug](https://npm.im/debug) module so you can also see the output by setting `DEBUG=stdout|stderr|*`.
