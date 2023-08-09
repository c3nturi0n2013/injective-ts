import { isServerSide } from '@injectivelabs/sdk-ts'
import { BrowserEip1993Provider, WindowWithEip1193Provider } from '../../types'

const $window = (isServerSide()
  ? {}
  : window) as unknown as WindowWithEip1193Provider

export async function getTrustWalletProvider({ timeout } = { timeout: 3000 }) {
  const provider = getTrustWalletFromWindow()

  if (provider) {
    return provider
  }

  return listenForTrustWalletInitialized({
    timeout,
  }) as Promise<BrowserEip1993Provider>
}

async function listenForTrustWalletInitialized(
  { timeout } = { timeout: 3000 },
) {
  return new Promise((resolve) => {
    const handleInitialization = () => {
      resolve(getTrustWalletFromWindow())
    }

    $window.addEventListener('trustwallet#initialized', handleInitialization, {
      once: true,
    })

    setTimeout(() => {
      $window.removeEventListener(
        'trustwallet#initialized',
        handleInitialization,
      )
      resolve(null)
    }, timeout)
  })
}

function getTrustWalletFromWindow() {
  const isTrustWallet = (ethereum: BrowserEip1993Provider) => {
    // Identify if Trust Wallet injected provider is present.
    const trustWallet = !!ethereum.isTrust

    return trustWallet
  }

  const injectedProviderExist =
    typeof window !== 'undefined' &&
    (typeof $window.ethereum !== 'undefined' ||
      typeof $window.trustWallet !== 'undefined')

  // No injected providers exist.
  if (!injectedProviderExist) {
    return null
  }

  if ($window.trustWallet) {
    return $window.trustWallet
  }

  if (isTrustWallet($window.ethereum)) {
    // Trust Wallet was injected into $window.ethereum.
    return $window.ethereum
  }

  if ($window.providers) {
    return $window.providers.find(isTrustWallet) ?? null
  }

  return null
}