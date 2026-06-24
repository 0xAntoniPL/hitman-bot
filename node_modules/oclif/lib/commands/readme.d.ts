import { Command, Interfaces } from '@oclif/core';
export default class Readme extends Command {
    static description: string;
    static flags: {
        dir: Interfaces.OptionFlag<string>;
        multi: Interfaces.BooleanFlag<boolean>;
    };
    private HelpClass;
    run(): Promise<void>;
    replaceTag(readme: string, tag: string, body: string): string;
    toc(__: Interfaces.Config, readme: string): string;
    usage(config: Interfaces.Config): string;
    multiCommands(config: Interfaces.Config, commands: Interfaces.Command[], dir: string): string;
    createTopicFile(file: string, config: Interfaces.Config, topic: Interfaces.Topic, commands: Interfaces.Command[]): void;
    commands(config: Interfaces.Config, commands: Interfaces.Command[]): string;
    renderCommand(config: Interfaces.Config, c: Interfaces.Command): string;
    commandCode(config: Interfaces.Config, c: Interfaces.Command): string | undefined;
    private repo;
    /**
     * fetches the path to a command
     */
    private commandPath;
    private commandUsage;
}
