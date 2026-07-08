// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'inqu... Remove this comment to see the full error message
import inquirer from 'inquirer'

const previousMenu = {
  name: 'Previous Menu',
  value: 1,
}

const quitCli = {
  name: 'Quit CLI',
  value: 0,
}

export const agreeDisclaimer = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Do you agree with the disclaimer?',
    }]).then((D: any) => {
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      if (D.confirm) return resolve()
      return process.exit()
    })
  })
}

export const chainSelectionChoices = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'list',
      name: 'list',
      message: 'Select Network:',
      pageSize: 88,
      choices: [{
        name: 'Ethereum Mainnet',
        value: 1,
      }, {
      //  name: 'Ethereum Rinkeby',
      //  value: 4,
      // }, {
        name: 'Binance Smart Chain',
        value: 56,
      }, {
        name: 'Polygon Mainnet',
        value: 137,
      }, {
        name: 'Fantom Opera',
        value: 250,
      }, {
        name: 'KCC Mainnet',
        value: 321,
      }, {
        name: 'Avalanche Mainnet',
        // eslint-disable-next-line unicorn/numeric-separators-style
        value: 43114,
      }, {
        name: 'Robinhood Chain',
        // eslint-disable-next-line unicorn/numeric-separators-style
        value: 4663,
      }, new inquirer.Separator(), quitCli],
    }]).then((D: any) => {
      return resolve(D.list)
    })
  })
}

export const exchangeSelection = (chain: any) => {
  return new Promise(resolve => {
    const J = {
      name: 'Launchpad',
      value: 'LAUNCH',
    }
    let l: any

    switch (chain) {
    case 1:
      l = [{
        name: 'Uniswap',
        value: 'UNI',
      }, {
        name: 'SushiSwap',
        value: 'SUSHI',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 4:
      l = [{
        name: 'Uniswap',
        value: 'UNI',
      }, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 56:
      l = [{
        name: 'PancakeSwap',
        value: 'PANCAKE',
      }, {
        name: 'ApeSwap',
        value: 'APE',
      }, {
        name: 'Candle Genie',
        value: 'CANDLE',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 137:
      l = [{
        name: 'QuickSwap',
        value: 'QUICK',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 250:
      l = [{
        name: 'SpookySwap',
        value: 'SPOOKY',
      }, {
        name: 'SpiritSwap',
        value: 'SPIRIT',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 321:
      l = [{
        name: 'KoffeeSwap',
        value: 'KOFFEE',
      }, {
        name: 'KuSwap',
        value: 'KU',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    case 43114:
      l = [{
        name: 'Trader Joe',
        value: 'TRADER',
      }, J, new inquirer.Separator(), previousMenu, quitCli]
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 4663:
      l = [{
        name: 'Uniswap on Robinhood Chain',
        value: 'RH_UNI',
      }, new inquirer.Separator(), previousMenu, quitCli]
      break

    default:
      l = []
      break
    }

    inquirer.prompt([{
      type: 'list',
      name: 'list',
      message: 'Select Exchange:',
      pageSize: 88,
      choices: l,
    }]).then((exchange: any) => {
      return resolve(exchange.list)
    })
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const exchangeMenuSelection = (exchange: any) => {
  return new Promise(resolve => {
    const reload = {
      name: 'Reload Configuration',
      value: 3,
    }

    const latencyTests = {
      name: 'Latency Ping Tests',
      value: 2,
    }

    const switchExchange = {
      name: 'Switch Exchange',
      value: 1,
    }

    let choices: any

    switch (exchange) {
    case 'UNI':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, {
        name: 'Flash Loan Arbitrage Bot',
        value: 20,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'SUSHI':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'PANCAKE':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, {
        name: 'Flash Loan Arbitrage Bot',
        value: 20,
      }, {
        name: 'CoinMarketCap Sniper',
        value: 30,
      }, {
        name: 'CoinGecko Sniper',
        value: 40,
      }, {
        name: 'PCS Prediction Bot',
        value: 50,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'APE':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'CANDLE':
      choices = [{
        name: 'BTC Prediction Bot',
        value: 90,
      }, {
        name: 'BNB Prediction Bot',
        value: 91,
      }, {
        name: 'ETH Prediction Bot',
        value: 92,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'QUICK':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'SPOOKY':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'SPIRIT':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'KOFFEE':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'KU':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'TRADER':
      choices = [{
        name: 'Fair Launch Sniping Tools',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'RH_UNI':
      choices = [{
        name: 'Manual Address Swap',
        value: 10,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    case 'LAUNCH':
      choices = [{
        name: 'DxSale Presale Bot',
        value: 60,
      }, {
        name: 'PinkSale Presale Bot',
        value: 70,
      }, {
        name: 'Developer Tools',
        value: 80,
      }, new inquirer.Separator(), reload, latencyTests, switchExchange, quitCli]
      break

    default:
      choices = []
      break
    }

    inquirer.prompt([{
      type: 'list',
      name: 'option',
      message: 'Select Option:',
      pageSize: 88,
      choices: choices,
    }, {
      type: 'list',
      name: 'selection',
      message: 'Select Mode:',
      pageSize: 88,
      choices: (exchangeChoice: any) => exchange === 'RH_UNI' && exchangeChoice.option === 10 ? [{
        name: 'Manual Input Address',
        value: 120,
      }, new inquirer.Separator(), previousMenu] : [{
        name: 'Telegram Scanner',
        value: 110,
      }, {
        name: 'Manual Input Address',
        value: 120,
      }, {
        name: 'Mempool On-Chain Order',
        value: 130,
      }, new inquirer.Separator(), previousMenu],
      when: (exchangeChoice: any) => exchangeChoice.option === 10,
    }, {
      type: 'list',
      name: 'selection',
      message: 'Select Mode:',
      pageSize: 88,
      choices: [{
        name: 'Fastest Alerts Telegram',
        value: 341,
      }, {
        name: 'Direct API Listener',
        value: 342,
      }, new inquirer.Separator(), previousMenu],
      when: (exchangeChoice: any) => {
        return exchangeChoice.option === 30 || exchangeChoice.option === 40
      },
    }, {
      type: 'list',
      name: 'selection',
      message: 'Select Mode:',
      pageSize: 88,
      choices: [{
        name: 'Only Streak Bets',
        value: 591,
      }, {
        name: 'Standard + Streak Bets',
        value: 592,
      }, {
        name: 'SS + Martingale Strategy',
        value: 593,
      }, new inquirer.Separator(), previousMenu],
      when: (exchangeChoice: any) => {
        return exchangeChoice.option === 50 || exchangeChoice.option === 90 || exchangeChoice.option === 91 || exchangeChoice.option === 92
      },
    }]).then((exchangeChoice: any) => resolve(exchangeChoice))
  })
}

export const telegramScannerInput = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'input',
      name: 'input',
      message: 'Group/Channel:',

      'validate'(D: any) {
        if (D && !D.match(/CMC_fastest_alerts\s?/i) && !D.match(/CG_fastest_alerts\s?/i)) return true
        return 'Enter the share link or username... Type `c` to cancel.'
      },

    }]).then((D: any) => {
      return resolve(D.input)
    })
  })
}

export const telegramScannerLogin = (G: any, D: any) => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: D ? 'password' : 'input',
      name: 'input',
      message: G,

      'validate'(l: any) {
        if (l) return true
        return 'Input cannot be empty...'
      },

    }]).then((l: any) => {
      return resolve(l.input)
    })
  })
}

export const contractAddressInput = (contractType: any) => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'input',
      name: 'input',
      message: contractType + ' Address:',

      'validate'(contractInput: any) {
        if (contractInput.match(/0x(.*)\s?/i) && contractInput.length === 42 || contractInput.toLowerCase() === 'c') return true
        return 'Invalid contract address... Type `c` to cancel.'
      },

    }]).then((contractInput: any) => {
      return resolve(contractInput.input)
    })
  })
}

export const fastestAlertsTelegramConfiguration = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'number',
      name: 'minLiq',
      message: 'Minimum Liquidity:',
      default: '50',
    }, {
      type: 'number',
      name: 'maxLiq',
      message: 'Maximum Liquidity:',
      default: '250',
    }, {
      type: 'number',
      name: 'minTax',
      message: 'Minimum Buy/Sell Tax:',
      default: '1',
    }, {
      type: 'number',
      name: 'maxTax',
      message: 'Maximum Buy/Sell Tax:',
      default: '20',
    }]).then((D: any) => {
      return resolve({
        minLiq: D.minLiq,
        maxLiq: D.maxLiq,
        minTax: D.minTax,
        maxTax: D.maxTax,
      })
    })
  })
}

export const confirmReload = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Reload now?',
    }]).then((D: any) => {
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      if (D.confirm) return resolve()
      return process.exit()
    })
  })
}

export const confirmProceed = () => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed now?',
    }]).then((J: any) => {
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      if (J.confirm) return resolve()
      return reject()
    })
  })
}

export const temporaryUnavailable = () => {
  return new Promise(resolve => {
    inquirer.prompt([{
      type: 'list',
      name: 'list',
      message: 'Temporary unavailable at this time.',
      choices: [previousMenu],
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    }]).then(() => resolve())
  })
}