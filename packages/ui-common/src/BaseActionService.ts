import { Web3Strategy } from '@injectivelabs/web3-strategy'
import { getUrlEndpointForNetwork } from '@injectivelabs/networks'
import { MetricsProvider } from './providers/MetricsProvider'
import { TxProvider } from './providers/TxProvider'
import { ServiceOptions, ServiceOptionsEndpoints } from './types'

export abstract class BaseActionService {
  protected options: ServiceOptions

  protected endpoints: ServiceOptionsEndpoints

  protected metricsProvider: MetricsProvider | undefined

  protected txProvider: TxProvider

  protected web3Strategy: Web3Strategy

  constructor(options: ServiceOptions, web3Strategy: Web3Strategy) {
    this.options = options
    this.endpoints =
      options.endpoints || getUrlEndpointForNetwork(options.network)

    if (options.metricsEnabled) {
      this.metricsProvider = new MetricsProvider({
        region: options.metricsRegion,
      })
    }

    this.web3Strategy = web3Strategy
    this.txProvider = new TxProvider({
      ...options,
      endpoints: this.endpoints,
      web3Strategy: this.web3Strategy,
      metricsProvider: this.metricsProvider,
    })
  }
}
