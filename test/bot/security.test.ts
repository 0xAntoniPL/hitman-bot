import {expect} from 'chai'
import {
  decryptSecret,
  encryptSecret,
  getAddressFromPrivateKey,
  maskAddress,
  normalizePrivateKey,
} from '../../src/bot/security'

describe('bot security', () => {
  const privateKey = '0x1111111111111111111111111111111111111111111111111111111111111111'
  const masterKey = 'test-master-key'

  it('encrypts and decrypts private keys', () => {
    const encrypted = encryptSecret(privateKey, masterKey)
    expect(encrypted.encryptedValue).to.not.equal(privateKey)
    expect(decryptSecret(encrypted, masterKey)).to.equal(privateKey)
  })

  it('normalizes private keys and derives wallet addresses', () => {
    const normalized = normalizePrivateKey(privateKey.slice(2))
    expect(normalized).to.equal(privateKey)
    expect(getAddressFromPrivateKey(normalized)).to.match(/^0x[a-fA-F0-9]{40}$/)
  })

  it('masks wallet addresses', () => {
    expect(maskAddress('0x1234567890123456789012345678901234567890')).to.equal('0x1234...7890')
  })
})
