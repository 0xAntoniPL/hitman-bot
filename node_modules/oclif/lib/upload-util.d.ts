import { Interfaces } from '@oclif/core';
import { BuildConfig as TarballConfig } from './tarballs/config';
export declare function commitAWSDir(version: string, sha: string, s3Config: TarballConfig['s3Config']): string;
export declare function channelAWSDir(channel: string, s3Config: TarballConfig['s3Config']): string;
export declare function templateShortKey(type: keyof Interfaces.PJSON.S3.Templates | 'macos' | 'win32' | 'deb', ext?: '.tar.gz' | '.tar.xz' | Interfaces.Config.s3Key.Options, options?: Interfaces.Config.s3Key.Options): string;
export declare function debArch(arch: Interfaces.ArchTypes): string;
export declare function debVersion(buildConfig: TarballConfig): string;
