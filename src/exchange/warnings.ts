export const warnUnsupportedDexRoute = (exchange: string, chainId: number): void => {
  if (chainId === 4663 && exchange !== 'RH_UNI') {
    console.warn(`Warning: exchange ${exchange} is not supported on Robinhood Chain (4663). Use RH_UNI (Uniswap V2).`);
  }
  if (chainId === 4663) {
    console.warn('Warning: Universal Router / Uniswap V3 / V4 routes are not supported on Robinhood Chain in this build.');
  }
};
