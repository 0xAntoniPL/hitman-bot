import { HelpBase } from '.';
export default class extends HelpBase {
    showHelp(): Promise<void>;
    showCommandHelp(): Promise<void>;
    getCommandHelpForReadme(): string;
}
