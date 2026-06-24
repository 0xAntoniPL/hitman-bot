import { Command } from '@oclif/core';
export default class HelpCommand extends Command {
    static description: string;
    static flags: {
        'nested-commands': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static strict: boolean;
    run(): Promise<void>;
}
