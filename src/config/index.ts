const Conf = require('conf');
import {homedir} from 'os';
import * as path from 'path';
//import { cpu, mem, osInfo, system } from "systeminformation";

const getCoreLocation = (G: any) => {
  if (G) return path.join(homedir(), 'Documents', 'defi-cli-configs', G);
  return path.join(homedir(), 'Documents', 'defi-cli-configs');
};

const configSchema = {
  amt_mode: {
    type: 'string',
    default: 'USD',
  },
  amount: {
    type: 'string',
    default: '10',
  },
  slippage: {
    type: 'string',
    default: '100',
  },
  iteration: {
    type: 'string',
    default: '1',
  },
  gas_price: {
    type: 'string',
    default: '0',
  },
  priority_gas: {
    type: 'string',
    default: '1',
  },
  honeypot_check: {
    type: 'string',
    default: 'false',
  },
  block_severe_fee: {
    type: 'string',
    default: 'false',
  },
  delay_execution: {
    type: 'string',
    default: '0',
  },
  delay_iteration: {
    type: 'string',
    default: '0',
  },
  rug_pull_check: {
    type: 'string',
    default: 'false',
  },
  sell_management: {
    type: 'string',
    default: 'false',
  },
  telegram: {
    type: 'object',
    default: {},
    properties: {
      api_id: {
        type: 'string',
        default: '',
      },
      api_hash: {
        type: 'string',
        default: '',
      },
    },
  },
} as const;

export const config = new Conf({
  schema: configSchema,
  configName: 'config',
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  cwd: getCoreLocation(),
});

const nodeSchema = {
  eth: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default:
          'wss://mainnet.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
      rpc: {
        type: 'string',
        default:
          'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
    },
  },
  eth_rinkeby: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default:
          'wss://rinkeby.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
      rpc: {
        type: 'string',
        default:
          'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
    },
  },
  bsc: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: 'wss://bsc-ws-node.nariox.org:443',
      },
      rpc: {
        type: 'string',
        default: 'https://bsc-dataseed.binance.org/',
      },
    },
  },
  matic: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: 'wss://ws-matic-mainnet.chainstacklabs.com/',
      },
      rpc: {
        type: 'string',
        default: 'https://polygon-rpc.com/',
      },
    },
  },
  ftm: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: 'wss://wsapi.fantom.network/',
      },
      rpc: {
        type: 'string',
        default: 'https://rpc.ftm.tools/',
      },
    },
  },
  kcs: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: 'wss://rpc-ws-mainnet.kcc.network/',
      },
      rpc: {
        type: 'string',
        default: 'https://rpc-mainnet.kcc.network/',
      },
    },
  },
  avax: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: 'wss://api.avax.network/ext/bc/C/ws',
      },
      rpc: {
        type: 'string',
        default: 'https://api.avax.network/ext/bc/C/rpc',
      },
    },
  },
  robinhood: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: '',
      },
      rpc: {
        type: 'string',
        default: '',
      },
    },
  },
  robinhood_testnet: {
    type: 'object',
    default: {},
    properties: {
      websockets: {
        type: 'string',
        default: '',
      },
      rpc: {
        type: 'string',
        default: '',
      },
    },
  },
} as const;

export const nodeConfig = new Conf({
  schema: nodeSchema,
  configName: 'nodeConfig',
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  cwd: getCoreLocation(),
});

const walletSchema = {
  private_key: {
    type: 'string',
    default: '',
  },
  additional_private_keys: {
    type: 'array',
    default: [],
  },
} as const;

export const walletConfig = new Conf({
  schema: walletSchema,
  configName: 'wallets',
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  cwd: getCoreLocation(),
});