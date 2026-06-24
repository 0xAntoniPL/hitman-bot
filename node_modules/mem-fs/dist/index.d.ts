/// <reference types="node" />
import { EventEmitter } from 'events';
import File = require('vinyl');
import { PassThrough } from 'stream';
export declare class Store extends EventEmitter {
    private store;
    private load;
    get(filepath: string): File;
    existsInMemory(filepath: string): boolean;
    add(file: File): this;
    each(onEach: (file: File, index: number) => void): this;
    all(): File[];
    stream(): PassThrough;
}
export declare function create(): Store;
