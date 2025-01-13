import type RawKeyRegister from '../rawkeys'

export interface FetcherOptions {
  url?: string
  retries?: number
}

export default interface KeyFetcher {
  fetch(options?: FetcherOptions): Promise<RawKeyRegister[]>
}
