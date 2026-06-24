import { BuildConfig } from './config';
export declare function build(c: BuildConfig, options?: {
    platform?: string;
    pack?: boolean;
    tarball?: string;
}): Promise<void>;
