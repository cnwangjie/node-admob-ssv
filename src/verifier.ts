import { createVerify } from 'node:crypto'
import querystring from 'node:querystring'
import debugLib from 'debug'
import type KeyDictCache from './keydict/cache/cache'
import KeyProvider, { type KeyProviderInterface } from './keydict/provider'

const debug = debugLib('admob-ssv:verifier')

/**
 * Usable message object
 *
 * @typedef {object} ParsedMessage
 * @property {number} keyId Key Id
 * @property {Buffer} signature Signagure
 * @property {Buffer} body Union qs attributes as buffer
 */
export interface ParsedMessage {
  keyId: number
  signature: Buffer
  body: Buffer
}

/**
 * Verifier options
 *
 * @typedef {object} VerifierOptions
 * @property {KeyProviderInterface} keyProvider Key provider, by default create new
 * @property {KeyDictCache} keyCache If keyProvider is not defined, use custom KeyDictCache
 */
export interface VerifierOptions {
  keyProvider?: KeyProviderInterface
  keyCache?: KeyDictCache
}

/**
 * Parse querystring to object
 *
 * @param {string} raw String of querystring
 * @returns {object} key, value dictionary from querystring
 */
export function parseQueryString(raw: string): object {
  debug(`Parsing query string`)
  return querystring.parse(raw)
}

/**
 * Parse params object to parsed message
 *
 * @param {object} data Raw key: value dicto
 * @returns {ParsedMessage} Usable message
 */
export function parseMessage(data: Record<string, any>): ParsedMessage {
  debug(`Parsing message`)
  const { key_id, signature, ...fdata } = data
  // Sort atttributes
  const qs = querystring
    .stringify(fdata, undefined, undefined, { encodeURIComponent: (s) => s })
    .split('&')
    .sort()
    .join('&')

  return {
    keyId: Number.parseInt(key_id, 10),
    signature: Buffer.from(signature, 'base64'),
    body: Buffer.from(qs, 'utf8'),
  }
}

/**
 * Verifier class
 */
export default class Verifier {
  private keyProvider: KeyProviderInterface

  /**
   * Create new verifier
   */
  constructor(options: VerifierOptions = {}) {
    this.keyProvider =
      options.keyProvider ||
      new KeyProvider({
        cache: options.keyCache,
      })
  }

  /**
   * Verify data
   *
   * @param data Raw Data
   * @returns True if is verified
   */
  async verify(data: ParsedMessage | object | string) {
    debug(`Verify`)

    const parsedData =
      typeof data === 'string'
        ? parseMessage(parseQueryString(data))
        : !(data as any).body
          ? parseMessage(data)
          : (data as ParsedMessage)

    const { keyId, signature, body } = parsedData

    debug(`\tGetting key ${keyId}`)

    const key = await this.keyProvider.get(keyId)

    if (!key) {
      throw new Error('Key not found')
    }

    const verifier = createVerify('RSA-SHA256')
    verifier.update(body)

    debug(`\tVerifying`)
    return verifier.verify(key, signature)
  }
}
