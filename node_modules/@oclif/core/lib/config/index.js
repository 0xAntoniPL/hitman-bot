"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsPath = exports.Plugin = exports.toCached = exports.Config = void 0;
try {
    // eslint-disable-next-line node/no-missing-require
    require('fs-extra-debug');
}
catch { }
var config_1 = require("./config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.Config; } });
Object.defineProperty(exports, "toCached", { enumerable: true, get: function () { return config_1.toCached; } });
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "Plugin", { enumerable: true, get: function () { return plugin_1.Plugin; } });
var ts_node_1 = require("./ts-node");
Object.defineProperty(exports, "tsPath", { enumerable: true, get: function () { return ts_node_1.tsPath; } });
