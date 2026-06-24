import * as Generator from 'yeoman-generator';
export default class CLI extends Generator {
    options: {
        defaults?: boolean;
        force: boolean;
        yarn: boolean;
    };
    name: string;
    pjson: any;
    githubUser: string | undefined;
    answers: {
        name: string;
        bin: string;
        description: string;
        version: string;
        github: {
            repo: string;
            user: string;
        };
        author: string;
        files: string;
        license: string;
        pkg: string;
        typescript: boolean;
        eslint: boolean;
        mocha: boolean;
        ci: {
            circleci: boolean;
            appveyor: boolean;
            travisci: boolean;
        };
    };
    yarn: boolean;
    repository?: string;
    constructor(args: string | string[], opts: Generator.GeneratorOptions);
    prompting(): Promise<void>;
    writing(): void;
    end(): void;
    private _gitignore;
}
