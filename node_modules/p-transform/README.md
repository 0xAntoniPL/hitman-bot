# p-transform

Promised out of order transform.

## Usage

A [Transform](https://nodejs.org/api/stream.html#implementing-a-transform-stream) that uses objectMode and implements custom `_write` and `_flush` methods.
`transform` implementation must be sync or return a promise. Callback is not supported.

Promisified `pipeline` and `transform` shortcut are provided for convenience.

```
const { PTransform, transform, pipeline } = require('p-transform');

await pipeline(
  new PTransform({
    transform: async file => file
  }),
  transform(async file => file);
)
```

## Debug

Use `DEBUG=p-transform:*` environment variable.

For custom debug name set `logName` option at PTransform constructor or `transform` argument.

## License

Apache-2.0

# API

## Classes

<dl>
<dt><a href="#PTransform">PTransform</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#pipeline">pipeline</a></dt>
<dd><p>Promisified pipeline</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#transform">transform(transform, logName)</a></dt>
<dd><p>Shortcut to create a PTransform with transform and logName.</p>
</dd>
<dt><a href="#passthrough">passthrough(spy, logName)</a></dt>
<dd><p>Shortcut to create a passthrough PTransform with spy and logName.</p>
</dd>
<dt><a href="#filter">filter(filter, logName)</a></dt>
<dd><p>Shortcut to create a filter PTransform with filter and logName.</p>
</dd>
</dl>

<a name="PTransform"></a>

## PTransform

**Kind**: global class

- [PTransform](#PTransform)
  - [new PTransform([options])](#new_PTransform_new)
  - [.name(name)](#PTransform+name) ⇒ [<code>PTransform</code>](#PTransform)
  - [.flushQueue()](#PTransform+flushQueue) ⇒
  - [.queuedTransform(chunk, encoding)](#PTransform+queuedTransform) ⇒

<a name="new_PTransform_new"></a>

### new PTransform([options])

PTransform

| Param                  | Type                  | Description                            |
| ---------------------- | --------------------- | -------------------------------------- |
| [options]              | <code>Object</code>   | Options object forwarded to Transform. |
| [options.logName]      | <code>String</code>   | Custom name for logger.                |
| [options.transform]    | <code>function</code> | Transform function.                    |
| [options.queueOptions] | <code>Object</code>   | Options forwarded to PQueue instance.  |

<a name="PTransform+name"></a>

### pTransform.name(name) ⇒ [<code>PTransform</code>](#PTransform)

Set log name.

**Kind**: instance method of [<code>PTransform</code>](#PTransform)
**Returns**: [<code>PTransform</code>](#PTransform) - this

| Param | Type                |
| ----- | ------------------- |
| name  | <code>String</code> |

<a name="PTransform+flushQueue"></a>

### pTransform.flushQueue() ⇒

Wait for queue idle.

**Kind**: instance method of [<code>PTransform</code>](#PTransform)
**Returns**: Promise<void>
<a name="PTransform+queuedTransform"></a>

### pTransform.queuedTransform(chunk, encoding) ⇒

Queued transform operation.

**Kind**: instance method of [<code>PTransform</code>](#PTransform)
**Returns**: Promise

| Param    | Type                |
| -------- | ------------------- |
| chunk    | <code>Object</code> |
| encoding | <code>String</code> |

<a name="pipeline"></a>

## pipeline

Promisified pipeline

**Kind**: global constant
<a name="transform"></a>

## transform(transform, logName)

Shortcut to create a PTransform with transform and logName.

**Kind**: global function

| Param     | Type                  |
| --------- | --------------------- |
| transform | <code>function</code> |
| logName   | <code>String</code>   |

<a name="passthrough"></a>

## passthrough(spy, logName)

Shortcut to create a passthrough PTransform with spy and logName.

**Kind**: global function

| Param   | Type                  |
| ------- | --------------------- |
| spy     | <code>function</code> |
| logName | <code>String</code>   |

<a name="filter"></a>

## filter(filter, logName)

Shortcut to create a filter PTransform with filter and logName.

**Kind**: global function

| Param   | Type                  |
| ------- | --------------------- |
| filter  | <code>function</code> |
| logName | <code>String</code>   |
