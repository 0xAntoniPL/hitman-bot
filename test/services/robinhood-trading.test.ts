import {expect} from 'chai'
import {formatUnits, parseUnits} from '../../src/services/robinhood-trading'

describe('robinhood trading utilities', () => {
  it('parses decimal amounts into token units', () => {
    expect(parseUnits('1.25', 6).toString()).to.equal('1250000')
    expect(parseUnits('0.000000000000000001', 18).toString()).to.equal('1')
  })

  it('formats token units into decimal strings', () => {
    expect(formatUnits(parseUnits('1.25', 6), 6)).to.equal('1.25')
    expect(formatUnits(parseUnits('10', 18), 18)).to.equal('10')
  })

  it('rejects too many decimals', () => {
    expect(() => parseUnits('1.0000001', 6)).to.throw('Amount supports up to 6 decimals')
  })
})
