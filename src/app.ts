import BN from 'bn.js'
import chalk from 'chalk'
import ora from 'ora'
import {
  fetchTrustWalletTokens,
} from './components/fetch/index'
import {
  castFiglet,
} from './components/figlet/index'
import {
  agreeDisclaimer,
  chainSelectionChoices,
  confirmProceed,
  confirmReload,
  contractAddressInput,
  exchangeMenuSelection,
  exchangeSelection,
  fastestAlertsTelegramConfiguration,
  telegramScannerInput,
  temporaryUnavailable,
} from './components/inquirer/index'
import {
  initializeWeb3,
} from './components/web3/index'
import {
  fileLogger,
  somethingWentWrong,
} from './components/winston/index'
import {
  printErrorHeading,
  printHeading,
  printInfoLine,
  printLocation,
  printMainHeader,
  printReason,
  printSubHeading,
  printSubInfoLine,
  printTxnCompleted,
} from './console/index'
import {
  initializeEthereum,
} from './ethereum/index'
import {
  getAmountsOut,
  getBalance,
  getNative,
  getSymbol,
  getUsd,
  initializeExchange,
} from './exchange/index'
import {
  formatEther,
  formatGWei,
  formatWei,
  getPrimaryBlock,
  getPrimaryGas,
  getSecondaryBlock,
  getUserAddress,
  initializeHelper,
  numberWithCommas,
  regexFastestAlertsMessage,
  regexMessageForCa,
  runPrimaryLatencyTests,
  runSecondaryLatencyTests,
} from './helper/index'
import {
  executePredictionBot,
  executePresaleContribution,
  executeSniperSwap,
  initializePresaleContract,
} from './parser/index'
import {
  initializeTelegram,
  stopTelegram,
} from './telegram/index'
import {
  getCoreLocation,
  // readFile,
  // validateConfigs,
  validateSettings,
  validateTelegram,
  // writeFile
} from './utilities/index'
import {config, walletConfig} from './config/index'

const Package = {
  name: 'defi-cli',
  version: '0.3.1',
}

let settings: any
let configs: any
let telegram: any
let chain: any
let exchange: any
let exchangeName: any

export async function start() {
  castFiglet(Package.name.toUpperCase()).then(G => {
    printMainHeader(G, Package.version)
    printErrorHeading('DISCLAIMER')
    console.log('All investment strategies and investments involve risk of loss.')
    console.log('By using DEFI-CLI, you agree to accept all liabilities, and that')
    console.log('no claims can be made against the developers.')
    console.log('\nDEFI-CLI is ' + chalk.yellow('FREE') + ' to download.')
    console.log('If you paid someone to download DEFI-CLI, you have been ' + chalk.red('SCAMMED') + '!')

    agreeDisclaimer().then(() => {
      initializeFiles()
    })
  })
}

const initializeFiles = () => {
  settings = walletConfig.store
  configs = config.store
  telegram = config.get('telegram')
  return chainSelection()
  // readFile('settings').then(G => {
  //     settings = G;
  //     configs = config.store;
  //     console.log(configs)
  //     telegram = config.get('telegram');
  //     console.log(telegram);
  //     return chainSelection();

  //     readFile('configs').then(D => {
  //         configs = D;

  //         readFile('telegram').then(J => {
  //             telegram = J;
  //             return chainSelection();
  //         }).catch(() => {
  //             writeFile('telegram', {
  //                 'API_ID': '',
  //                 'API_HASH': ''
  //             }).then(() => initializeFiles());
  //         });
  //     }).catch(() => {
  //         writeFile('configs', {
  //             'amt_mode': 'USD',
  //             'amount': '10',
  //             'slippage': '100',
  //             'iteration': '1',
  //             'gas_price': '0',
  //             'priority_gas': '1',
  //             'honeypot_check': 'false',
  //             'block_severe_fee': 'false',
  //             'delay_execution': '0',
  //             'delay_iteration': '0',
  //             'rug_pull_check': 'false',
  //             'sell_management': 'false'
  //         }).then(() => initializeFiles());
  //     });
  // }).catch(() => {
  //     writeFile('settings', {
  //         'EVM_NODE': 'GA',
  //         'private_key': ''
  //     }).then(() => initializeFiles());
  // });
}

const chainSelection = () => {
  castFiglet(Package.name.toUpperCase()).then(packageName => {
    printMainHeader(packageName, Package.version)
    printHeading('Ethereum Virtual Machine')

    chainSelectionChoices().then(chainSelection => {
      if (chainSelection === 0)
        return process.exit()
      else {
        chain = chainSelection

        exchangeSelection(chain).then(exchangeSelection => {
          if (exchangeSelection === 0) return process.exit()
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          return exchangeSelection === 1 ? chainSelection() : (exchange = exchangeSelection, preloadEthereum())
        })
      }
    })
  })
}

const preloadEthereum = () => {
  const spinner = ora({text: ('Connecting'), spinner: 'aesthetic'}).start()
  validateSettings(settings).then(() => {
    initializeWeb3(chain).then(nodeList => {
      initializeEthereum(nodeList).then(() => {
        initializeHelper().then(() => {
          initializeExchange(chain, exchange).then(() => {
            spinner.stop()
            return bootstrapExchange()
          })
        })
      })
    }).catch(error => {
      spinner.stop()
      printErrorHeading('ERROR ESTABLISHING CONNECTION')
      printReason(error)
      printLocation(getCoreLocation('nodeConfig.json'))

      confirmReload().then(() => {
        // readFile('settings').then(J => {
        settings = walletConfig.store
        return preloadEthereum()
        // }).catch(() => {
        //    fileLogger.error('CORE: readFile(): Not Found');
        //    return somethingWentWrong();
        // });
      })
    })
  }).catch(error => {
    spinner.stop()
    printErrorHeading('MISCONFIGURED SETTINGS')
    printReason(error)
    printLocation(getCoreLocation('nodeConfig.json'))

    confirmReload().then(() => {
      settings = walletConfig.store
      // readFile('settings').then(J => {
      //    settings = J;
      return preloadEthereum()
      // }).catch(() => {
      //    fileLogger.error('CORE: readFile(): Not Found');
      //    return somethingWentWrong();
      // });
    })
  })
}

const bootstrapExchange = () => {
  // readFile('configs').then(G => {
  // configs = G;
  configs = config.store
  switch (exchange) {
  case 'UNI':
    exchangeName = 'Uniswap'
    break

  case 'SUSHI':
    exchangeName = 'SushiSwap'
    break

  case 'PANCAKE':
    exchangeName = 'PancakeSwap'
    break

  case 'APE':
    exchangeName = 'ApeSwap'
    break

  case 'CANDLE':
    exchangeName = 'Candle Genie'
    break

  case 'QUICK':
    exchangeName = 'QuickSwap'
    break

  case 'SPOOKY':
    exchangeName = 'SpookySwap'
    break

  case 'SPIRIT':
    exchangeName = 'SpiritSwap'
    break

  case 'KOFFEE':
    exchangeName = 'KoffeeSwap'
    break

  case 'KU':
    exchangeName = 'KuSwap'
    break

  case 'TRADER':
    exchangeName = 'Trader Joe'
    break

  case 'LAUNCH':
    exchangeName = 'Launchpad'
    break

  default:
    exchangeName = ''
    break
  }

  castFiglet(exchangeName).then(D => {
    printMainHeader(D, Package.version)

    parseUserDetails().then(() => {
      parseChainDetails().then(() => parseConfiguration())
    })
  })
  // }).catch(() => {
  //     fileLogger.error('CORE: readFile(): Not Found');
  //     return somethingWentWrong();
  // });
}

const parseUserDetails = async () => {
  printHeading('User Details')
  const G = getUserAddress(settings.private_key)
  printInfoLine('Wallet Address', '0x...' + G.slice(38))
  const J = await getBalance(G)
  let l = await getAmountsOut(J)
  if (chain !== 56 && chain !== 321) l = formatWei(l.toString(), 'szabo')
  printInfoLine(getSymbol() + ' Balance', numberWithCommas(Number(formatEther(J)).toFixed(4)) + ' ' + getSymbol() + ' (' + numberWithCommas(Number(formatEther(l)).toFixed(2)) + ' USD)')
}

const parseChainDetails = async () => {
  let chainName

  switch (chain) {
  case 1:
    chainName = 'Ethereum Mainnet'
    break

  case 4:
    chainName = 'Rinkeby Test Network'
    break

  case 56:
    chainName = 'Binance Smart Chain'
    break

  case 137:
    chainName = 'Polygon Mainnet'
    break

  case 250:
    chainName = 'Fantom Opera'
    break

  case 321:
    chainName = 'KCC Mainnet'
    break

  case 43114:
    chainName = 'Avalanche Mainnet'
    break

  default:
    chainName = ''
    break
  }

  printHeading('Chain Details')
  // const evmNode = settings.EVM_NODE;
  // evmNode.toLowerCase().startsWith('https') || evmNode.toLowerCase().startsWith('wss') ? printInfoLine('Network', evmNode) : printInfoLine('Network', chainName + ' (' + evmNode.toUpperCase() + ')');
  printInfoLine('Network', chainName)
  const J = await getPrimaryGas()
  printInfoLine('Network Gas', formatGWei(J) + ' GWei')
  const l = await getPrimaryBlock()
  printInfoLine('Node Block', chalk.yellow(l))
  const X = await getSecondaryBlock()
  printInfoLine('Chain Block', chalk.yellow(X))
  let u = chalk.red('OUT-OF-SYNC')
  if (l >= X || l - X >= -5) u = chalk.green('IN-SYNC')
  printInfoLine('Status', u)
}

const parseConfiguration = () => {
  // validateConfigs(configs, chain).then(() => {
  printHeading('Loaded Configs')
  printInfoLine('Transactions', chalk.bold(configs.amount) + ' ' + configs.amt_mode.toUpperCase() + ' * ' + chalk.bold(configs.iteration) + ' Iteration (' + chalk.bold(configs.gas_price === '0' ? 'Auto' : configs.gas_price) + ' / ' + chalk.bold(configs.priority_gas) + ' GWei)')
  printInfoLine('Honeypot Check', 'Enable ' + chalk.bold('' + configs.honeypot_check.charAt(0).toUpperCase() + configs.honeypot_check.slice(1).toLowerCase()) + ' / Block Severe Fee ' + chalk.bold('' + configs.block_severe_fee.charAt(0).toUpperCase() + configs.block_severe_fee.slice(1).toLowerCase()))
  printInfoLine('Sniper Swap Delay', 'Execution ' + chalk.bold(configs.delay_execution) + ' Sec / Iteration ' + chalk.bold(configs.delay_iteration) + ' Sec')
  printInfoLine('After Sniper Swap', 'Rug Pull Check ' + chalk.bold('' + configs.rug_pull_check.charAt(0).toUpperCase() + configs.rug_pull_check.slice(1).toLowerCase()) + ' / Sell Mgn ' + chalk.bold('' + configs.sell_management.charAt(0).toUpperCase() + configs.sell_management.slice(1).toLowerCase()))
  return exchangeMenu()
  // }).catch(G => {
  // printErrorHeading('MISCONFIGURED CONFIGS');
  // printReason(G);
  // printLocation(getCoreLocation('configs.json'));
  // confirmReload().then(() => bootstrapExchange());
  // });
}

const exchangeMenu = () => {
  printHeading(exchangeName + ' Menu')

  exchangeMenuSelection(exchange).then(menu => {
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    if (menu.option === 0) return process.exit()
    else {
      // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
      if (menu.option === 1) return chainSelection()
      else {
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        if (menu.option === 2) return latencyPingTests()
        else {
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          if (menu.option === 3 || menu.selection && menu.selection === 1) return bootstrapExchange()
          else {
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            if (menu.option === 60 || menu.option === 70) {
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              if (chain === 250 && menu.option === 70) {
                printErrorHeading('NOT SUPPORTED')
                printReason('PinkSale does not support Fantom Opera.')
                temporaryUnavailable().then(() => bootstrapExchange())
              } else
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
                return estimatedSpendingRouter(menu.option)
            } else {
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              if (menu.selection) {
                // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
                if (menu.selection === 130 || menu.selection === 342) temporaryUnavailable().then(() => bootstrapExchange())
                // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
                else return estimatedSpendingRouter(menu.option, menu.selection)
              } else temporaryUnavailable().then(() => bootstrapExchange())
            }
          }
        }
      }
    }
  })
}

const latencyPingTests = async () => {
  printHeading('Latency Ping Tests')
  const spinner = ora({text: ('Pinging'), spinner: 'aesthetic'}).start()
  const D = await runPrimaryLatencyTests()
  const J = await runSecondaryLatencyTests()
  spinner.stop()
  console.log('Results are in milliseconds.\n')
  printInfoLine('Primary Node', '' + chalk.yellow(Number(D).toFixed(4)))
  printInfoLine('Secondary Node', '' + chalk.yellow(Number(J).toFixed(4)))
  confirmReload().then(() => bootstrapExchange())
}

const estimatedSpendingRouter = async (menuOption: any, menuSelection = 0) => {
  printHeading('Estimated Spending')
  let J
  let l
  const X = menuSelection !== 130 && menuSelection !== 120 && menuSelection !== 110 ? parseFloat(configs.amount) : parseFloat(configs.amount) * parseInt(configs.iteration)

  if (configs.amt_mode.toLowerCase() === 'usd') {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const p = chain !== 56 && chain !== 321 ? formatWei(X.toString(), 'mwei') : formatWei(X.toString())
    J = await getAmountsOut(p, getUsd(), getNative())
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    l = new BN(formatWei(X.toString()))
  } else {
    if (configs.amt_mode.toLowerCase() === 'eth') {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      J = new BN(formatWei(X.toString()))
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      l = await getAmountsOut(formatWei(X.toString()))
      if (chain !== 56 && chain !== 321) l = formatWei(l.toString(), 'szabo')
    } else {
      fileLogger.error('CORE: estimatedSpendingRouter(): Native Error')
      return somethingWentWrong()
    }
  }

  const u = getUserAddress(settings.private_key)
  printInfoLine(getSymbol() + ' Spending', '~' + numberWithCommas(Number(formatEther(J)).toFixed(4)) + ' ' + getSymbol() + ' (' + numberWithCommas(Number(formatEther(l)).toFixed(2)) + ' USD)')
  if (menuSelection !== 130 && menuSelection !== 120 && menuSelection !== 110) console.log(chalk.bold('Per Transaction') + ' (Iteration Excluded)')
  console.log('\nPlease make sure you have more than enough ' + getSymbol() + ' balance')
  console.log('in your wallet, otherwise the transaction will not be submitted.')
  const x = await getBalance(u)
  x.lt(J.mul(new BN('20')).div(new BN('100')).add(J)) ? (printErrorHeading('INSUFFICIENT BALANCE'), console.log('You do not have enough ' + getSymbol() + '.'), confirmReload().then(() => bootstrapExchange())) : confirmProceed().then(() => {
    if (menuOption === 60 || menuOption === 70) return dxPinkPresaleBot(menuOption)
    else {
      if (menuSelection === 110) return telegramScanner()
      else {
        if (menuSelection === 120) return manualInputAddress()
        else {
          if (menuSelection === 341) return fastestAlertsTelegram(menuOption, menuSelection)
          else return menuSelection === 591 || menuSelection === 592 || menuSelection === 593 ? predictionBot(menuOption, menuSelection) : (fileLogger.error('CORE: estimatedSpendingRouter(): Router Error'), somethingWentWrong())
        }
      }
    }
  }).catch(() => bootstrapExchange())
}

const dxPinkPresaleBot = (menuOption: any) => {
  printHeading((menuOption === 60 ? 'DxSale' : 'PinkSale') + ' Presale Sniper')

  contractAddressInput('Presale').then(async contractAddress => {
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    if (contractAddress.length === 42) {
      const spinner = ora({text: ('Loading'), spinner: 'aesthetic'}).start()

      try {
        await initializePresaleContract(contractAddress, menuOption).then(async l => {
          spinner.stop()
          printSubHeading('Presale Information')
          console.log('Make sure all the fetched data are correct.')

          console.table({
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            'Presale Address': l.presaleAddress,
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            'Token Address': l.tokenAddress,
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            'Token Name': l.tokenName + ' (' + l.tokenSymbol + ')',
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            'Min Contribution': numberWithCommas(Number(formatEther(l.minContribution)).toFixed(4)) + ' ' + getSymbol(),
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            'Max Contribution': numberWithCommas(Number(formatEther(l.maxContribution)).toFixed(4)) + ' ' + getSymbol(),
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            'Soft/Hard Cap': numberWithCommas(Number(formatEther(l.softCap)).toFixed(0)) + '/' + numberWithCommas(Number(formatEther(l.hardCap)).toFixed(0)) + ' ' + getSymbol(),
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            'Start Time': new Date(+l.startTime * 1000).toUTCString(),
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            'End Time': new Date(+l.endTime * 1000).toUTCString(),
          })

          const X = Math.floor(Date.now() / 1000)

          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          if (X < +l.endTime) {
            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            if (X < +l.startTime) console.log('Not yet started, but you can set pending orders.')
            let amountsOut: any
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            if (configs.amt_mode.toLowerCase() === 'usd') amountsOut = await getAmountsOut(chain !== 56 && chain !== 321 ? formatWei(configs.amount, 'mwei') : formatWei(configs.amount), getUsd(), getNative())
            else {
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
              if (configs.amt_mode.toLowerCase() === 'eth') amountsOut = new BN(formatWei(configs.amount))
              else {
                fileLogger.error('CORE: dxPinkPresaleBot(): Native Error')
                throw 'Native Error'
              }
            }

            // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
            if (amountsOut.gte(l.minContribution) && amountsOut.lte(l.maxContribution)) {
              printSubInfoLine('Contribution Amount', formatEther(amountsOut) + ' ' + getSymbol())

              confirmProceed().then(async () => {
                // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
                await executePresaleContribution(getUserAddress(settings.private_key), settings.private_key, l.presaleAddress, l.startTime, menuOption, configs, chain, amountsOut).then(() => {
                  printTxnCompleted()
                  confirmReload().then(() => bootstrapExchange())
                })
              }).catch(error => {
                if (!error) return bootstrapExchange()
                printErrorHeading('PRESALE SNIPER ERROR')
                printReason(error)
                confirmReload().then(() => bootstrapExchange())
              })
            } else
              throw 'Contribution amount does not meet the min/max.'
          } else throw 'The entered presale address has already ended.'
        })
      } catch (error) {
        spinner.stop()
        printErrorHeading('PRESALE SNIPER ERROR')
        printReason(error)
        confirmReload().then(() => bootstrapExchange())
      }
    } else return bootstrapExchange()
  })
}

const telegramScanner = () => {
  validateTelegram(telegram).then(() => {
    printHeading('Telegram Scanner')

    fetchTrustWalletTokens(chain).then(D => {
      telegramScannerInput().then(J => {
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        if (J.toLowerCase() === 'c') return bootstrapExchange()
        else {
          const spinner = ora({text: ('Listening'), spinner: 'aesthetic'})
          let contractAddress: any
          let u: any
          initializeTelegram(telegram, J, async (E: any) => {
            if (typeof E === 'object') return u = E

            if (!contractAddress) {
              spinner.info(E ? 'Received Message: { ' + E + ' }' : '< Service Message/Media File >')
              spinner.start()
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
              E && (await regexMessageForCa(E, D).then(s => {
                spinner.stop()
                printSubInfoLine('\nFound CA', s)
                contractAddress = s
              }))

              if (contractAddress) {
                stopTelegram()

                try {
                  await executeSniperSwap(getUserAddress(settings.private_key), settings.private_key, contractAddress, configs, chain, exchange).then(() => {
                    printTxnCompleted()
                    confirmReload().then(() => bootstrapExchange())
                  })
                } catch (error) {
                  printErrorHeading('SNIPER SWAP ERROR')
                  printReason(error)
                  confirmReload().then(() => bootstrapExchange())
                }
              }
            }
          }).catch(() => {
            printErrorHeading('TELEGRAM ERROR ' + u.error_code)
            printReason(u.error_message)
            confirmReload().then(() => telegramScanner())
          })
        }
      })
    })
  }).catch(error => {
    printErrorHeading('MISCONFIGURED TELEGRAM')
    printReason(error)
    printLocation(getCoreLocation('config.json'))

    confirmReload().then(() => {
      // readFile('telegram').then(D => {
      telegram = config.get('telegram')
      return telegramScanner()
      // }).catch(() => {
      //    fileLogger.error('CORE: readFile(): Not Found');
      //    return somethingWentWrong();
      // });
    })
  })
}

const manualInputAddress = () => {
  printHeading('Manual Sniper')

  contractAddressInput('Token').then(async contractAddress => {
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    if (contractAddress.length === 42) try {
      await executeSniperSwap(getUserAddress(settings.private_key), settings.private_key, contractAddress, configs, chain, exchange).then(() => {
        printTxnCompleted()
        confirmReload().then(() => bootstrapExchange())
      })
    } catch (error) {
      printErrorHeading('SNIPER SWAP ERROR')
      printReason(error)
      confirmReload().then(() => bootstrapExchange())
    } else return bootstrapExchange()
  })
}

const fastestAlertsTelegram = (menuOption: any, menuSelection: any) => {
  validateTelegram(telegram).then(() => {
    const listing = {
      name: '',
      telegram: '',
    }

    switch (menuOption) {
    case 30:
      listing.name = 'CoinMarketCap'
      listing.telegram = 'CMC_fastest_alerts'
      break

    case 40:
      listing.name = 'CoinGecko'
      listing.telegram = 'CG_fastest_alerts'
      break

    default:
      fileLogger.error('CORE: fastestAlertsTelegram(): EOFError')
      return somethingWentWrong()
    }

    printHeading(' Fastest Alerts')

    fastestAlertsTelegramConfiguration().then(async u => {
      const spinner = ora({text: ('Listening'), spinner: 'aesthetic'})
      const E: any = []
      let contractAddress: any
      let j: any
      return initializeTelegram(telegram, 'https://t.me/' + listing.telegram, async (x: any) => {
        if (typeof x === 'object') return j = x

        if (!contractAddress) {
          spinner.info(x ? 'Received Message: { ' + x + ' }' : '< Service Message/Media File >')
          spinner.start()
          x && (await regexFastestAlertsMessage(x, u).then(Q => {
            spinner.stop()
            printSubInfoLine('\nFound Red CA', Q)
            E.includes(Q) ? (printErrorHeading('Skipping! History: ' + E), spinner.start()) : contractAddress = Q
          }))
          if (contractAddress) try {
            await executeSniperSwap(getUserAddress(settings.private_key), settings.private_key, contractAddress, configs, chain, exchange, menuSelection).then(() => {
              printTxnCompleted()
              printHeading(' Fastest Alerts')
              spinner.start()
              E.push(contractAddress)
              contractAddress = null
            })
          } catch (error) {
            printErrorHeading('SNIPER SWAP ERROR')
            printReason(error)
            printHeading(' Fastest Alerts')
            spinner.start()
            E.push(contractAddress)
            contractAddress = null
          }
        }
      }).catch(() => {
        printErrorHeading('TELEGRAM ERROR ' + j.error_code)
        printReason(j.error_message)
        confirmReload().then(() => fastestAlertsTelegram(menuOption, menuSelection))
      })
    })
  }).catch(error => {
    printErrorHeading('MISCONFIGURED TELEGRAM')
    printReason(error)
    printLocation(getCoreLocation('config.json'))

    confirmReload().then(() => {
      // readFile('telegram').then(l => {
      telegram = config.get('telegram')
      return fastestAlertsTelegram(menuOption, menuSelection)
      // }).catch(() => {
      //    fileLogger.error('CORE: readFile(): Not Found');
      //    return somethingWentWrong();
      // });
    })
  })
}

const predictionBot = (menuOption: any, menuSelection: any) => {
  printHeading('Prediction Bot')
  console.log('The methodology behind the bot is to calculate the mathematical')
  console.log('expectation and bet strategically.')

  confirmProceed().then(async () => {
    try {
      await executePredictionBot(getUserAddress(settings.private_key), settings.private_key, configs, menuOption, menuSelection)
    } catch (error) {
      printErrorHeading('PREDICTION BOT ERROR')
      printReason(error)
      confirmReload().then(() => bootstrapExchange())
    }
  }).catch(() => bootstrapExchange())
}

export default initializeFiles
