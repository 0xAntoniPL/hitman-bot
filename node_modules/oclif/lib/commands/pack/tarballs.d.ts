import { Command } from '@oclif/core';
export default class PackTarballs extends Command {
    static description: string;
    static flags: {
        root: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        targets: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        xz: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        tarball: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
