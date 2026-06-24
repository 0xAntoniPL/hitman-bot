import {Hook} from '@oclif/core'
import { config, nodeConfig, walletConfig } from '../../config/index.js'

const hook: Hook<'init'> = async function (opts) {
        config();
        nodeConfig();
        await walletConfig();
}

export default hook
