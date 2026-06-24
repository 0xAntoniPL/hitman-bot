import BN from 'bn.js'
import {
  getSecondary,
} from '../ethereum/index'

export const fetchPresaleContract = (contractAddress: any, menuOption: any) => {
  return new Promise((resolve, reject) => {
    const X = getSecondary()
    let u: any

    switch (menuOption) {
    case 60:
      u = new X.eth.Contract([{
        inputs: [],
        name: 'token',
        outputs: [{
          internalType: 'address',
          name: '',
          type: 'address',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'minEthContribution',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'maxEthContribution',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'goal',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'cap',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'presaleStartTime',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'presaleEndTime',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }], contractAddress)
      break

    case 70:
      u = new X.eth.Contract([{
        inputs: [],
        name: 'token',
        outputs: [{
          internalType: 'address',
          name: '',
          type: 'address',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'minContribution',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'maxContribution',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'softCap',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'hardCap',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'startTime',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        inputs: [],
        name: 'endTime',
        outputs: [{
          name: '',
          type: 'uint256',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }], contractAddress)
      break

    default:
      return reject('Launchpad EOFError')
    }

    u.methods.token().call().then(async (E: any) => {
      const s = new X.eth.Contract([{
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{
          name: '',
          type: 'string',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }, {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{
          name: '',
          type: 'string',
        }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      }], E)

      const j = menuOption === 60 ? u.methods.minEthContribution : u.methods.minContribution
      return await j().call().catch(() => {
        return reject('Does this address belongs to ' + (menuOption === 60 ? 'DxSale' : 'PinkSale') + '?')
      }), resolve({
        presaleAddress: u._address,
        tokenAddress: s._address,
        tokenName: await s.methods.name().call(),
        tokenSymbol: await s.methods.symbol().call(),
        minContribution: new BN(menuOption === 60 ? await u.methods.minEthContribution().call() : await u.methods.minContribution().call()),
        maxContribution: new BN(menuOption === 60 ? await u.methods.maxEthContribution().call() : await u.methods.maxContribution().call()),
        softCap: new BN(menuOption === 60 ? await u.methods.goal().call() : await u.methods.softCap().call()),
        hardCap: new BN(menuOption === 60 ? await u.methods.cap().call() : await u.methods.hardCap().call()),
        startTime: menuOption === 60 ? await u.methods.presaleStartTime().call() : await u.methods.startTime().call(),
        endTime: menuOption === 60 ? await u.methods.presaleEndTime().call() : await u.methods.endTime().call(),
      })
    }).catch(() => reject('Unable to fetch token address.'))
  })
}
