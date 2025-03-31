import type RawKeyRegister from '../rawkeys'
import type KeyFetcher from './fetcher'
import type { FetcherOptions } from './fetcher'

export const KEY_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json'

export default class SimpleFetcher implements KeyFetcher {
  async fetch(options: FetcherOptions = {}) {
    const res = await fetch(options.url || KEY_URL)

    if (!res.ok) {
      throw new Error(`Failed to fetch keys: ${res.statusText}`)
    }

    const data = await res.json()

    return data.keys as RawKeyRegister[]
  }
}

export class RetryFetcher extends SimpleFetcher implements KeyFetcher {
  constructor(
    public maxRetries = 3,
    public delay = 1000,
  ) {
    super()
  }

  override async fetch(options: FetcherOptions = {}) {
    for (let i = this.maxRetries; i > 0; i -= 1) {
      try {
        return await super.fetch(options)
      } catch (err) {
        await new Promise(resolve => setTimeout(resolve, this.delay))
      }
    }
    throw new Error(`Failed to fetch keys after ${this.maxRetries} retries`)
  }
}
