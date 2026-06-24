import * as Generator from 'yeoman-generator';
import { GeneratorOptions, PackageJson } from '../types';
export interface Options extends GeneratorOptions {
    event: string;
}
export default class Hook extends Generator {
    options: Options;
    pjson: PackageJson;
    constructor(args: string | string[], options: Options);
    private hasMocha;
    prompting(): Promise<void>;
    writing(): void;
}
