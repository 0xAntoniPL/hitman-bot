import { Command } from '@oclif/core';
import { Interfaces } from '@oclif/core';
export default class PackWin extends Command {
    static description: string;
    static flags: {
        root: Interfaces.OptionFlag<string>;
        'additional-cli': Interfaces.OptionFlag<string | undefined>;
        tarball: Interfaces.OptionFlag<string | undefined>;
    };
    run(): Promise<void>;
    private checkForNSIS;
}
