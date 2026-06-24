import { Command } from './command';
import { Config } from './config';
import { Plugin } from './plugin';
interface HookMeta {
    options: Record<string, unknown>;
    return: any;
}
export interface Hooks {
    [event: string]: HookMeta;
    init: {
        options: {
            id: string | undefined;
            argv: string[];
        };
        return: void;
    };
    prerun: {
        options: {
            Command: Command.Class;
            argv: string[];
        };
        return: void;
    };
    postrun: {
        options: {
            Command: Command.Class;
            result?: any;
            argv: string[];
        };
        return: void;
    };
    preupdate: {
        options: {
            channel: string;
            version: string;
        };
        return: void;
    };
    update: {
        options: {
            channel: string;
            version: string;
        };
        return: void;
    };
    'command_not_found': {
        options: {
            id: string;
            argv?: string[];
        };
        return: unknown;
    };
    'plugins:preinstall': {
        options: {
            plugin: {
                name: string;
                tag: string;
                type: 'npm';
            } | {
                url: string;
                type: 'repo';
            };
        };
        return: void;
    };
}
export declare type Hook<T extends keyof P, P extends Hooks = Hooks> = (this: Hook.Context, options: P[T]['options'] & {
    config: Config;
}) => Promise<P[T]['return']>;
export declare namespace Hook {
    type Init = Hook<'init'>;
    type PluginsPreinstall = Hook<'plugins:preinstall'>;
    type Prerun = Hook<'prerun'>;
    type Postrun = Hook<'postrun'>;
    type Preupdate = Hook<'preupdate'>;
    type Update = Hook<'update'>;
    type CommandNotFound = Hook<'command_not_found'>;
    interface Context {
        config: Config;
        exit(code?: number): void;
        error(message: string | Error, options?: {
            code?: string;
            exit?: number;
        }): void;
        warn(message: string): void;
        log(message?: any, ...args: any[]): void;
        debug(...args: any[]): void;
    }
    interface Result<T> {
        successes: Array<{
            result: T;
            plugin: Plugin;
        }>;
        failures: Array<{
            error: Error;
            plugin: Plugin;
        }>;
    }
}
export {};
