import chalk from 'chalk'

export const printMainHeader = (packageName: any, version: any) => {
  console.clear()
  console.log(packageName)
  console.log(chalk.blue('DeFi Command-Line Interface') + ' v' + version)
}

export const printErrorHeading = (G: any) => {
  console.log(chalk.red('\n' + G))
}

export const printHeading = (G: any) => {
  console.log(chalk.yellow.inverse('\n' + G))
}

export const printSubHeading = (G: any) => {
  console.log(chalk.yellow('\n' + G))
}

export const printReason = (G: any) => {
  console.log(chalk.blue('Reason:'), G)
}

export const printLocation = (G: any) => {
  console.log('Location: ' + chalk.blue(G))
}

export const printInfoLine = (G: any, D: any) => {
  console.log(chalk.blue(G) + ': ' + D)
}

export const printSubInfoLine = (G: any, D: any) => {
  console.log(chalk.yellow(G) + ': ' + D)
}

export const printTxnCompleted = () => {
  console.log(chalk.blue('\nDONE!') + ' ' + chalk.yellow('Check Txn in Block Explorer'))
}