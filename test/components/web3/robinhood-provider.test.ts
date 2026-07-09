import {expect} from 'chai';
import fixtures from '../../fixtures/robinhood.json';

describe('Robinhood RPC mocks', () => {
  it('fixture exposes mainnet chain id', () => {
    expect(fixtures.chainId).to.equal(4663);
  });

  it('fixture includes router and tokens', () => {
    expect(fixtures.router).to.match(/^0x[0-9a-fA-F]{40}$/);
    expect(fixtures.weth).to.match(/^0x[0-9a-fA-F]{40}$/);
  });
});
