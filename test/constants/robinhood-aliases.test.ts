import {expect} from 'chai';
import {SupportedChain, isRobinhoodChain} from '../../src/constants/chains';
import {ROBINHOOD_MAINNET_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID} from '../../src/constants/robinhood';

describe('Robinhood chain aliases', () => {
  it('maps mainnet and testnet ids', () => {
    expect(SupportedChain.Robinhood).to.equal(ROBINHOOD_MAINNET_CHAIN_ID);
    expect(SupportedChain.RobinhoodTestnet).to.equal(ROBINHOOD_TESTNET_CHAIN_ID);
  });

  it('detects robinhood chain keys', () => {
    expect(isRobinhoodChain(4663)).to.equal(true);
    expect(isRobinhoodChain(46630)).to.equal(true);
    expect(isRobinhoodChain(1)).to.equal(false);
  });
});
