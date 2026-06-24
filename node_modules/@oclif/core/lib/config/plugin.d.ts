import { Plugin as IPlugin, PluginOptions } from '../interfaces/plugin';
import { Command } from '../interfaces/command';
import { Manifest } from '../interfaces/manifest';
import { PJSON } from '../interfaces/pjson';
import { Topic } from '../interfaces/topic';
export declare class Plugin implements IPlugin {
    options: PluginOptions;
    _base: string;
    name: string;
    version: string;
    pjson: PJSON.Plugin;
    type: string;
    root: string;
    alias: string;
    tag?: string;
    manifest: Manifest;
    commands: Command.Plugin[];
    hooks: {
        [k: string]: string[];
    };
    valid: boolean;
    alreadyLoaded: boolean;
    parent: Plugin | undefined;
    children: Plugin[];
    protected _debug: (..._: any) => void;
    protected warned: boolean;
    constructor(options: PluginOptions);
    load(): Promise<void>;
    get topics(): Topic[];
    get commandsDir(): string | undefined;
    get commandIDs(): string[];
    findCommand(id: string, opts: {
        must: true;
    }): Promise<Command.Class>;
    findCommand(id: string, opts?: {
        must: boolean;
    }): Promise<Command.Class | undefined>;
    protected _manifest(ignoreManifest: boolean, errorOnManifestCreate?: boolean): Promise<Manifest>;
    protected warn(err: any, scope?: string): void;
    private addErrorScope;
}
