import { Command } from '@oclif/core';
export default class Promote extends Command {
    static description: string;
    static flags: {
        root: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        version: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        sha: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        channel: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        targets: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        deb: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        macos: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        win: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'max-age': import("@oclif/core/lib/interfaces").OptionFlag<string>;
        xz: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        indexes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
