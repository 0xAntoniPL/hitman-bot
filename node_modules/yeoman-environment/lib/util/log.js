/** @module env/log */
const util = require('util');
const EventEmitter = require('events');
const _ = require('lodash');
const table = require('text-table');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const npmlog = require('npmlog');

npmlog.level = 'error';

// Padding step
const step = '  ';
let padding = ' ';

function pad(status) {
  const max = 'identical'.length;
  const delta = max - status.length;
  return delta ? ' '.repeat(delta) + status : status;
}

// Borrowed from https://github.com/mikeal/logref/blob/master/main.js#L6-15
function formatter(message, ctx) {
  while (message.includes('%')) {
    const start = message.indexOf('%');
    let end = message.indexOf(' ', start);

    if (end === -1) {
      end = message.length;
    }

    message = message.slice(0, start) + ctx[message.slice(start + 1, end)] + message.slice(end);
  }

  return message;
}

const getDefaultColors = () => ({
  skip: 'yellow',
  force: 'yellow',
  create: 'green',
  invoke: 'bold',
  conflict: 'red',
  identical: 'cyan',
  info: 'gray'
});

const initParameters = parameters => {
  parameters = parameters || {};
  return {
    ...parameters, colors: {...getDefaultColors(), ...parameters.colors}};
};

const log = parameters => {
  parameters = initParameters(parameters);
  const customConsole = parameters.console || console;
  const stderr = parameters.stderr || parameters.stdout || process.stderr;

  // `this.log` is a [logref](https://github.com/mikeal/logref)
  // compatible logger, with an enhanced API.
  //
  // It also has EventEmitter like capabilities, so you can call on / emit
  // on it, namely used to increase or decrease the padding.
  //
  // All logs are done against STDERR, letting you stdout for meaningfull
  // value and redirection, should you need to generate output this way.
  //
  // Log functions take two arguments, a message and a context. For any
  // other kind of paramters, `console.error` is used, so all of the
  // console format string goodies you're used to work fine.
  //
  // - msg      - The message to show up
  // - context  - The optional context to escape the message against
  //
  // @param {Object} params
  // @param {Object} params.colors status mappings
  //
  // Returns the logger
  function log(message, ctx) {
    message = message || '';

    if (typeof ctx === 'object' && !Array.isArray(ctx)) {
      customConsole.error(formatter(message, ctx));
    } else {
      customConsole.error.apply(customConsole, arguments);
    }

    return log;
  }

  _.extend(log, EventEmitter.prototype);

  // A simple write method, with formatted message.
  //
  // Returns the logger
  log.write = function () {
    stderr.write(util.format.apply(util, arguments));
    return this;
  };

  // Same as `log.write()` but automatically appends a `\n` at the end
  // of the message.
  log.writeln = function () {
    this.write.apply(this, arguments);
    this.write('\n');
    return this;
  };

  // Convenience helper to write sucess status, this simply prepends the
  // message with a gren `✔`.
  log.ok = function () {
    this.write(logSymbols.success + ' ' + util.format.apply(util, arguments) + '\n');
    return this;
  };

  log.error = function () {
    this.write(logSymbols.error + ' ' + util.format.apply(util, arguments) + '\n');
    return this;
  };

  log.on('up', () => {
    padding += step;
  });

  log.on('down', () => {
    padding = padding.replace(step, '');
  });

  for (const status of Object.keys(parameters.colors)) {
    // Each predefined status has its logging method utility, handling
    // status color and padding before the usual `.write()`
    //
    // Example
    //
    //    this.log
    //      .write()
    //      .info('Doing something')
    //      .force('Forcing filepath %s, 'some path')
    //      .conflict('on %s' 'model.js')
    //      .write()
    //      .ok('This is ok');
    //
    // The list of default status and mapping colors
    //
    //    skip       yellow
    //    force      yellow
    //    create     green
    //    invoke     bold
    //    conflict   red
    //    identical  cyan
    //    info       grey
    //
    // Returns the logger
    log[status] = function () {
      const color = parameters.colors[status];
      this.write(chalk[color](pad(status))).write(padding);
      this.write(util.format.apply(util, arguments) + '\n');
      return this;
    };
  }

  // A basic wrapper around `cli-table` package, resetting any single
  // char to empty strings, this is used for aligning options and
  // arguments without too much Math on our side.
  //
  // - opts - A list of rows or an Hash of options to pass through cli
  //          table.
  //
  // Returns the table reprensetation
  log.table = options => {
    const tableData = [];

    options = Array.isArray(options) ? {rows: options} : options;
    options.rows = options.rows || [];

    for (const row of options.rows) {
      tableData.push(row);
    }

    return table(tableData);
  };

  return log;
};

log.tracker = npmlog;

module.exports = log;
