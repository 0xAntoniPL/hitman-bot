export declare function compact<T>(a: (T | undefined)[]): T[];
export declare function uniqBy<T>(arr: T[], fn: (cur: T) => any): T[];
declare type SortTypes = string | number | undefined | boolean;
export declare function sortBy<T>(arr: T[], fn: (i: T) => SortTypes | SortTypes[]): T[];
export declare function castArray<T>(input?: T | T[]): T[];
export declare function isProd(): boolean;
export {};
