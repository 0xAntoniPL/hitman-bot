"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const plugins_1 = require("../plugins");
const update = async function () {
    const plugins = new plugins_1.default(this.config);
    try {
        await plugins.update();
    }
    catch (error) {
        this.error(error.message);
    }
};
exports.update = update;
