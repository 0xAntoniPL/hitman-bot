declare const _default: (code?: number) => {
    run(): never;
    catch(ctx: {
        error: any;
    }): void;
};
/**
 * ensures that a oclif command or hook exits
 *
 * @param {number} code expected code
 * @default 0
 */
export default _default;
