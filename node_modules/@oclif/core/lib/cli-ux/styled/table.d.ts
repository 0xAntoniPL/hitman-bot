import * as Interfaces from '../../interfaces';
export declare function table<T extends Record<string, unknown>>(data: T[], columns: table.Columns<T>, options?: table.Options): void;
export declare namespace table {
    export const Flags: {
        columns: Interfaces.OptionFlag<string | undefined>;
        sort: Interfaces.OptionFlag<string | undefined>;
        filter: Interfaces.OptionFlag<string | undefined>;
        csv: Interfaces.Flag<boolean>;
        output: Interfaces.OptionFlag<string | undefined>;
        extended: Interfaces.Flag<boolean>;
        'no-truncate': Interfaces.Flag<boolean>;
        'no-header': Interfaces.Flag<boolean>;
    };
    type IFlags = typeof Flags;
    type ExcludeFlags<T, Z> = Pick<T, Exclude<keyof T, Z>>;
    type IncludeFlags<T, K extends keyof T> = Pick<T, K>;
    export function flags(): IFlags;
    export function flags<Z extends keyof IFlags = keyof IFlags>(opts: {
        except: Z | Z[];
    }): ExcludeFlags<IFlags, Z>;
    export function flags<K extends keyof IFlags = keyof IFlags>(opts: {
        only: K | K[];
    }): IncludeFlags<IFlags, K>;
    export interface Column<T extends Record<string, unknown>> {
        header: string;
        extended: boolean;
        minWidth: number;
        get(row: T): any;
    }
    export type Columns<T extends Record<string, unknown>> = {
        [key: string]: Partial<Column<T>>;
    };
    export interface Options {
        [key: string]: any;
        sort?: string;
        filter?: string;
        columns?: string;
        extended?: boolean;
        'no-truncate'?: boolean;
        output?: string;
        'no-header'?: boolean;
        printLine?(s: any): any;
    }
    export {};
}
