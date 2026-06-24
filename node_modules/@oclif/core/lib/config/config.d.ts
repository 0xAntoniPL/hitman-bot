import { Options, Plugin as IPlugin } from '../interfaces/plugin';
import { Config as IConfig, ArchTypes, PlatformTypes, LoadOptions } from '../interfaces/config';
import { Command, Hook, Hooks, PJSON, Topic } from '../interfaces';
import * as Plugin from './plugin';
export declare class Config implements IConfig {
    options: Options;
    _base: string;
    name: string;
    version: string;
    channel: string;
    root: string;
    arch: ArchTypes;
    bin: string;
    cacheDir: string;
    configDir: string;
    dataDir: string;
    dirname: string;
    errlog: string;
    home: string;
    platform: PlatformTypes;
    shell: string;
    windows: boolean;
    userAgent: string;
    debug: number;
    npmRegistry?: string;
    pjson: PJSON.CLI;
    userPJSON?: PJSON.User;
    plugins: IPlugin[];
    binPath?: string;
    valid: boolean;
    topicSeparator: ':' | ' ';
    protected warned: boolean;
    private _commands?;
    private _commandIDs?;
    private _topics?;
    constructor(options: Options);
    static load(opts?: LoadOptions): Promise<IConfig | Config>;
    load(): Promise<void>;
    loadCorePlugins(): Promise<void>;
    loadDevPlugins(): Promise<void>;
    loadUserPlugins(): Promise<void>;
    runHook<T extends keyof Hooks>(event: T, opts: Hooks[T]['options'], timeout?: number): Promise<Hook.Result<Hooks[T]['return']>>;
    runCommand<T = unknown>(id: string, argv?: string[], cachedCommand?: Command.Plugin): Promise<T>;
    scopedEnvVar(k: string): string | undefined;
    scopedEnvVarTrue(k: string): boolean;
    scopedEnvVarKey(k: string): string;
    findCommand(id: string, opts: {
        must: true;
    }): Command.Plugin;
    findCommand(id: string, opts?: {
        must: boolean;
    }): Command.Plugin | undefined;
    findTopic(id: string, opts: {
        must: true;
    }): Topic;
    findTopic(id: string, opts?: {
        must: boolean;
    }): Topic | undefined;
    get commands(): Command.Plugin[];
    get commandIDs(): string[];
    get topics(): Topic[];
    s3Key(type: keyof PJSON.S3.Templates, ext?: '.tar.gz' | '.tar.xz' | IConfig.s3Key.Options, options?: IConfig.s3Key.Options): string;
    s3Url(key: string): string;
    protected dir(category: 'cache' | 'data' | 'config'): string;
    protected windowsHome(): string | undefined;
    protected windowsHomedriveHome(): string | undefined;
    protected windowsUserprofileHome(): string | undefined;
    protected macosCacheDir(): string | undefined;
    protected _shell(): string;
    protected _debug(): number;
    protected loadPlugins(root: string, type: string, plugins: (string | {
        root?: string;
        name?: string;
        tag?: string;
    })[], parent?: Plugin.Plugin): Promise<void>;
    protected warn(err: string | Error | {
        name: string;
        detail: string;
    }, scope?: string): void;
    protected get isProd(): boolean;
}
export declare function toCached(c: Command.Class, plugin?: IPlugin): Promise<Command>;
