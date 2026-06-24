import { Command } from '@oclif/core';
import { Interfaces } from '@oclif/core';
export default class PackDeb extends Command {
    static description: string;
    static flags: {
        root: Interfaces.OptionFlag<string>;
        tarball: Interfaces.OptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
