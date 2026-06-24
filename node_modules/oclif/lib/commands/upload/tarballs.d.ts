import { Command } from '@oclif/core';
import { Interfaces } from '@oclif/core';
export default class UploadTarballs extends Command {
    static description: string;
    static flags: {
        root: Interfaces.OptionFlag<string>;
        targets: Interfaces.OptionFlag<string | undefined>;
        xz: Interfaces.BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
