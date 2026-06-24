export interface IPromptOptions {
    prompt?: string;
    type?: 'normal' | 'mask' | 'hide' | 'single';
    timeout?: number;
    /**
     * Requires user input if true, otherwise allows empty input
     */
    required?: boolean;
    default?: string;
}
/**
 * prompt for input
 * @param name - prompt text
 * @param options - @see IPromptOptions
 * @returns void
 */
export declare function prompt(name: string, options?: IPromptOptions): Promise<any>;
/**
 * confirmation prompt (yes/no)
 * @param message - confirmation text
 * @returns Promise<boolean>
 */
export declare function confirm(message: string): Promise<boolean>;
/**
 * "press anykey to continue"
 * @param message - optional message to display to user
 * @returns Promise<void>
 */
export declare function anykey(message?: string): Promise<void>;
