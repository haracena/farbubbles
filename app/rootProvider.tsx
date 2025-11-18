'use client'
import { ReactNode } from 'react'
import { base } from 'wagmi/chains'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@coinbase/onchainkit/styles.css'
import { coinbaseWallet } from 'wagmi/connectors'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
    },
  },
})

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    miniAppConnector(),
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'spotlight',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
})

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: 'auto',
          },
          wallet: {
            display: 'modal',
            preference: 'all',
          },
        }}
        miniKit={{
          enabled: true,
          autoConnect: true,
          notificationProxyUrl: undefined,
        }}
      >
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </OnchainKitProvider>
    </QueryClientProvider>
  )
}
