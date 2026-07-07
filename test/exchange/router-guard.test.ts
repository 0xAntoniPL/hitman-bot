import {expect} from 'chai';
import {assertRouterConfigured} from '../../src/exchange/router-guard';

describe('router guard', () => {
  it('rejects empty router', () => {
    expect(() => assertRouterConfigured('')).to.throw(/not configured/);
  });

  it('accepts configured router', () => {
    expect(assertRouterConfigured('0x89e5DB8B5aA49aA85AC63f691524311AEB649eba')).to.equal(
      '0x89e5DB8B5aA49aA85AC63f691524311AEB649eba',
    );
  });
});
