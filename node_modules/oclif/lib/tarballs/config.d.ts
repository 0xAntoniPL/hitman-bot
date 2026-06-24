import { Interfaces } from '@oclif/core';
export declare const TARGETS: string[];
export interface BuildConfig {
    root: string;
    gitSha: string;
    config: Interfaces.Config;
    nodeVersion: string;
    tmp: string;
    updateConfig: BuildConfig['config']['pjson']['oclif']['update'];
    s3Config: BuildConfig['updateConfig']['s3'] & {
        folder?: string;
        indexVersionLimit?: number;
    };
    xz: boolean;
    targets: {
        platform: Interfaces.PlatformTypes;
        arch: Interfaces.ArchTypes;
    }[];
    workspace(target?: {
        platform: Interfaces.PlatformTypes;
        arch: Interfaces.ArchTypes;
    }): string;
    dist(input: string): string;
}
export declare function gitSha(cwd: string, options?: {
    short?: boolean;
}): Promise<string>;
export declare function buildConfig(root: string, options?: {
    xz?: boolean;
    targets?: string[];
}): Promise<BuildConfig>;
