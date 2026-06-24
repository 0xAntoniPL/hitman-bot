import * as Interfaces from '../interfaces';
import { HelpFormatter } from './formatter';
export default class RootHelp extends HelpFormatter {
    config: Interfaces.Config;
    opts: Interfaces.HelpOptions;
    constructor(config: Interfaces.Config, opts: Interfaces.HelpOptions);
    root(): string;
    protected usage(): string;
    protected description(): string | undefined;
    protected version(): string;
}
