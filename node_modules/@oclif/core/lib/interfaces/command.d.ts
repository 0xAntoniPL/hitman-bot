import { Config, LoadOptions } from './config';
import { ArgInput, BooleanFlagProps, FlagInput, OptionFlagProps } from './parser';
export declare type Example = string | {
    description: string;
    command: string;
};
export interface CommandProps {
    /** A command ID, used mostly in error or verbose reporting. */
    id: string;
    /** Hide the command from help? */
    hidden: boolean;
    /** Mark the command as a given state (e.g. beta) in help? */
    state?: string;
    /** An array of aliases for this command. */
    aliases: string[];
    /**
     * The tweet-sized description for your class, used in a parent-commands
     * sub-command listing and as the header for the command help.
     */
    summary?: string;
    /**
     * A full description of how to use the command.
     *
     * If no summary, the first line of the description will be used as the summary.
     */
    description?: string;
    /**
     * An override string (or strings) for the default usage documentation.
     */
    usage?: string | string[];
    /**
     * An array of examples to show at the end of the command's help.
     *
     * IF only a string is provide, it will try to look for a line that starts
     * with the cmd.bin as the example command and the rest as the description.
     * If found, the command will be formatted appropriately.
     *
     * ```
     * EXAMPLES:
     *   A description of a particular use case.
     *
     *     $ <%= config.bin => command flags
     * ```
     */
    examples?: Example[];
}
export interface Command extends CommandProps {
    type?: string;
    pluginName?: string;
    pluginType?: string;
    pluginAlias?: string;
    flags: {
        [name: string]: Command.Flag;
    };
    args: Command.Arg[];
    strict: boolean;
    hasDynamicHelp?: boolean;
}
export declare namespace Command {
    interface Arg {
        name: string;
        description?: string;
        required?: boolean;
        hidden?: boolean;
        default?: string;
        options?: string[];
    }
    type Flag = Flag.Boolean | Flag.Option;
    namespace Flag {
        interface Boolean extends BooleanFlagProps {
        }
        interface Option extends OptionFlagProps {
            default?: string;
            defaultHelp?: () => Promise<string>;
        }
    }
    interface Base extends CommandProps {
        _base: string;
    }
    interface Class extends Base {
        plugin?: Plugin;
        flags?: FlagInput<any>;
        args?: ArgInput;
        strict: boolean;
        hasDynamicHelp?: boolean;
        new (argv: string[], config: Config): Instance;
        run(argv?: string[], config?: LoadOptions): PromiseLike<any>;
    }
    interface Instance {
        _run(argv: string[]): Promise<any>;
    }
    interface Plugin extends Command {
        load(): Promise<Class>;
    }
}
