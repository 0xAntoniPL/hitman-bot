import crypto from 'node:crypto'
import Web3 from 'web3'

export interface EncryptedSecret {
  encryptedValue: string;
  iv: string;
  authTag: string;
}

const web3 = new Web3()

const deriveMasterKey = (masterKey: string) => crypto.createHash('sha256').update(masterKey).digest()

export const normalizePrivateKey = (privateKey: string) => {
  const trimmed = privateKey.trim()
  return trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
}

export const getAddressFromPrivateKey = (privateKey: string) => {
  const normalized = normalizePrivateKey(privateKey)
  return web3.eth.accounts.privateKeyToAccount(normalized).address
}

export const encryptSecret = (plaintext: string, masterKey: string): EncryptedSecret => {
  if (!masterKey) throw new Error('RH_BOT_MASTER_KEY is required')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveMasterKey(masterKey), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    encryptedValue: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  }
}

export const decryptSecret = (encrypted: EncryptedSecret, masterKey: string) => {
  if (!masterKey) throw new Error('RH_BOT_MASTER_KEY is required')
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveMasterKey(masterKey),
    Buffer.from(encrypted.iv, 'base64'),
  )
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.encryptedValue, 'base64')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

export const maskAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
