import { Command } from '@oclif/core';
export default abstract class CommandBase extends Command {
    protected generate(type: string, generatorOptions?: Record<string, unknown>): void;
}
