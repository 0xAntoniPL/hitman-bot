import { BuildConfig } from './tarballs';
export declare const appendToIndex: (input: {
    version: string;
    originalUrl: string;
    filename: string;
    maxAge: string;
    s3Config: BuildConfig['s3Config'];
}) => Promise<void>;
