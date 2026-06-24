import CommandBase from './../command-base';
export default class Generate extends CommandBase {
    static description: string;
    static flags: {};
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    run(): Promise<void>;
}
