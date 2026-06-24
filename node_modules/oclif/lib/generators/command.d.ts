import * as Generator from 'yeoman-generator';
import { GeneratorOptions, PackageJson } from '../types';
export default class Command extends Generator {
    options: GeneratorOptions;
    pjson: PackageJson;
    constructor(args: string | string[], opts: GeneratorOptions);
    private hasMocha;
    prompting(): Promise<void>;
    writing(): void;
}
