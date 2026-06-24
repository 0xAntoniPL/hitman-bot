import * as Interfaces from '../interfaces';
import { Example } from '../interfaces/command';
import { HelpFormatter, HelpSectionRenderer } from './formatter';
export declare class CommandHelp extends HelpFormatter {
    command: Interfaces.Command;
    config: Interfaces.Config;
    opts: Interfaces.HelpOptions;
    constructor(command: Interfaces.Command, config: Interfaces.Config, opts: Interfaces.HelpOptions);
    generate(): string;
    protected groupFlags(flags: Interfaces.Command.Flag[]): {
        mainFlags: Interfaces.Command.Flag[];
        flagGroups: {
            [index: string]: Interfaces.Command.Flag[];
        };
    };
    protected sections(): Array<{
        header: string;
        generate: HelpSectionRenderer;
    }>;
    protected usage(): string;
    protected defaultUsage(): string;
    protected description(): string | undefined;
    protected aliases(aliases: string[] | undefined): string | undefined;
    protected examples(examples: Example[] | undefined | string): string | undefined;
    protected args(args: Interfaces.Command['args']): [string, string | undefined][] | undefined;
    protected arg(arg: Interfaces.Command['args'][0]): string;
    protected flagHelpLabel(flag: Interfaces.Command.Flag, showOptions?: boolean): string;
    protected flags(flags: Interfaces.Command.Flag[]): [string, string | undefined][] | undefined;
    protected flagsDescriptions(flags: Interfaces.Command.Flag[]): string | undefined;
}
export default CommandHelp;
