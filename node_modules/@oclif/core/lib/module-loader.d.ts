import { Config as IConfig } from './interfaces';
import { Plugin as IPlugin } from './interfaces';
/**
 * Provides a static class with several utility methods to work with Oclif config / plugin to load ESM or CJS Node
 * modules and source files.
 *
 * @author Michael Leahy <support@typhonjs.io> (https://github.com/typhonrt)
 */
export default class ModuleLoader {
    /**
     * Loads and returns a module.
     *
     * Uses `getPackageType` to determine if `type` is set to 'module. If so loads '.js' files as ESM otherwise uses
     * a bare require to load as CJS. Also loads '.mjs' files as ESM.
     *
     * Uses dynamic import to load ESM source or require for CommonJS.
     *
     * A unique error, ModuleLoadError, combines both CJS and ESM loader module not found errors into a single error that
     * provides a consistent stack trace and info.
     *
     * @param {IConfig|IPlugin} config - Oclif config or plugin config.
     * @param {string} modulePath - NPM module name or file path to load.
     *
     * @returns {Promise<*>} The entire ESM module from dynamic import or CJS module by require.
     */
    static load(config: IConfig | IPlugin, modulePath: string): Promise<any>;
    /**
     * Loads a module and returns an object with the module and data about the module.
     *
     * Uses `getPackageType` to determine if `type` is set to `module`. If so loads '.js' files as ESM otherwise uses
     * a bare require to load as CJS. Also loads '.mjs' files as ESM.
     *
     * Uses dynamic import to load ESM source or require for CommonJS.
     *
     * A unique error, ModuleLoadError, combines both CJS and ESM loader module not found errors into a single error that
     * provides a consistent stack trace and info.
     *
     * @param {IConfig|IPlugin} config - Oclif config or plugin config.
     * @param {string} modulePath - NPM module name or file path to load.
     *
     * @returns {Promise<{isESM: boolean, module: *, filePath: string}>} An object with the loaded module & data including
     *                                                                   file path and whether the module is ESM.
     */
    static loadWithData(config: IConfig | IPlugin, modulePath: string): Promise<{
        isESM: boolean;
        module: any;
        filePath: string;
    }>;
    /**
     * For `.js` files uses `getPackageType` to determine if `type` is set to `module` in associated `package.json`. If
     * the `modulePath` provided ends in `.mjs` it is assumed to be ESM.
     *
     * @param {string} filePath - File path to test.
     *
     * @returns {boolean} The modulePath is an ES Module.
     * @see https://www.npmjs.com/package/get-package-type
     */
    static isPathModule(filePath: string): boolean;
    /**
     * Resolves a modulePath first by `require.resolve` to allow Node to resolve an actual module. If this fails then
     * the `modulePath` is resolved from the root of the provided config. `Config.tsPath` is used for initial resolution.
     * If this file path does not exist then several extensions are tried from `s_EXTENSIONS` in order: '.js', '.mjs',
     * '.cjs'. After a file path has been selected `isPathModule` is used to determine if the file is an ES Module.
     *
     * @param {IConfig|IPlugin} config - Oclif config or plugin config.
     * @param {string} modulePath - File path to load.
     *
     * @returns {{isESM: boolean, filePath: string}} An object including file path and whether the module is ESM.
     */
    static resolvePath(config: IConfig | IPlugin, modulePath: string): {
        isESM: boolean;
        filePath: string;
    };
}
