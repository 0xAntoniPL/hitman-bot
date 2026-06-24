import CommandBase from './../../command-base';
export default class GenerateHook extends CommandBase {
    static description: string;
    static flags: {
        force: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        event: import("@oclif/core/lib/interfaces").OptionFlag<string>;
    };
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    run(): Promise<void>;
}
