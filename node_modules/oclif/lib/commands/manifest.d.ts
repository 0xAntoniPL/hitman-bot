import { Command } from '@oclif/core';
export default class Manifest extends Command {
    static description: string;
    static args: {
        name: string;
        description: string;
        default: string;
    }[];
    run(): Promise<void>;
}
