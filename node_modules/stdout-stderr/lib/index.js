"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stripAnsi = require("strip-ansi");
const debug = require('debug')('stdout-stderr');
const g = global;
if (!g['stdout-stderr']) {
    g['stdout-stderr'] = {
        stdout: process.stdout.write,
        stderr: process.stderr.write,
    };
}
function bufToString(b) {
    if (typeof b === 'string')
        return b;
    return b.toString('utf8');
}
const originalConsoleLog = console.log;
/** mocks stdout or stderr */
function mock(std) {
    let writes = [];
    return {
        stripColor: true,
        print: false,
        start() {
            debug('start', std);
            writes = [];
            process[std].write = (data, ...args) => {
                writes.push(bufToString(data));
                if (this.print) {
                    g['stdout-stderr'][std].apply(process[std], [data, ...args]);
                }
                else {
                    const callback = args[0];
                    if (callback)
                        callback();
                }
                return true;
            };
            if (std === 'stdout') {
                console.log = (...args) => {
                    process.stdout.write(`${args.join(' ')}\n`);
                };
            }
        },
        stop() {
            process[std].write = g['stdout-stderr'][std];
            if (std === 'stdout')
                console.log = originalConsoleLog;
            debug('stop', std);
        },
        get output() {
            const o = this.stripColor ? writes.map(stripAnsi) : writes;
            return o.join('');
        },
    };
}
exports.stdout = mock('stdout');
exports.stderr = mock('stderr');
