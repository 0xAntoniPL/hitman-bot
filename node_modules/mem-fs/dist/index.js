"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.Store = void 0;
var events_1 = require("events");
var path = require("path");
var vinylFile = require("vinyl-file");
var File = require("vinyl");
var stream_1 = require("stream");
function createFile(filepath) {
    return new File({
        cwd: process.cwd(),
        base: process.cwd(),
        path: filepath,
        contents: null
    });
}
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    function Store() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.store = {};
        return _this;
    }
    Store.prototype.load = function (filepath) {
        var file;
        try {
            file = vinylFile.readSync(filepath);
        }
        catch (err) {
            file = createFile(filepath);
        }
        this.store[filepath] = file;
        return file;
    };
    Store.prototype.get = function (filepath) {
        filepath = path.resolve(filepath);
        return this.store[filepath] || this.load(filepath);
    };
    Store.prototype.existsInMemory = function (filepath) {
        filepath = path.resolve(filepath);
        return !!this.store[filepath];
    };
    Store.prototype.add = function (file) {
        this.store[file.path] = file;
        this.emit('change', file.path);
        return this;
    };
    Store.prototype.each = function (onEach) {
        var _this = this;
        Object.keys(this.store).forEach(function (key, index) {
            onEach(_this.store[key], index);
        });
        return this;
    };
    Store.prototype.all = function () {
        return Object.values(this.store);
    };
    Store.prototype.stream = function () {
        var _this = this;
        var stream = new stream_1.PassThrough({ objectMode: true, autoDestroy: true });
        setImmediate(function () {
            _this.each(function (file) { return stream.write(file); });
            stream.end();
        });
        return stream;
    };
    return Store;
}(events_1.EventEmitter));
exports.Store = Store;
function create() {
    return new Store();
}
exports.create = create;
;
