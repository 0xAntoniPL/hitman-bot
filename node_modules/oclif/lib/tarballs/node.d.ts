import { Interfaces } from '@oclif/core';
declare type Options = {
    nodeVersion: string;
    output: string;
    platform: Interfaces.PlatformTypes;
    arch: Interfaces.ArchTypes | 'armv7l';
    tmp: string;
};
export declare function fetchNodeBinary({ nodeVersion, output, platform, arch, tmp }: Options): Promise<string>;
export {};
