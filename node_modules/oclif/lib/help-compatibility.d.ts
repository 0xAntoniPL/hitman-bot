import { Interfaces, HelpBase } from '@oclif/core';
interface MaybeCompatibleHelp extends HelpBase {
    formatCommand?: (command: Interfaces.Command) => string;
    command?: (command: Interfaces.Command) => string;
}
export declare class HelpCompatibilityWrapper {
    inner: MaybeCompatibleHelp;
    constructor(inner: MaybeCompatibleHelp);
    formatCommand(command: Interfaces.Command): string;
}
export {};
