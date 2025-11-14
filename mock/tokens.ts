import { Token } from '@/interfaces/Token'

export const mockTokens: Token[] = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67854.32,
    change24h: 2.15,
    marketCap: 1330000000000,
    volume24h: 35000000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
  },
  {
    id: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3521.67,
    change24h: 1.42,
    marketCap: 422000000000,
    volume24h: 19000000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    address: '0x4200000000000000000000000000000000000006', // WETH on Base
  },
  {
    id: 3,
    symbol: 'BNB',
    name: 'BNB',
    price: 612.54,
    change24h: -0.86,
    marketCap: 90400000000,
    volume24h: 3800000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501977',
  },
  {
    id: 4,
    symbol: 'SOL',
    name: 'Solana',
    price: 174.9,
    change24h: 4.73,
    marketCap: 80600000000,
    volume24h: 4200000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/4128/large/solana.png?1696504756',
  },
  {
    id: 5,
    symbol: 'XRP',
    name: 'XRP',
    price: 0.64,
    change24h: -1.33,
    marketCap: 35000000000,
    volume24h: 2300000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442',
  },
  {
    id: 6,
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.48,
    change24h: 0.92,
    marketCap: 17000000000,
    volume24h: 720000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/975/large/cardano.png?1696502090',
  },
  {
    id: 7,
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.17,
    change24h: 3.86,
    marketCap: 24000000000,
    volume24h: 1500000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1696501409',
  },
  {
    id: 8,
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 39.42,
    change24h: -2.21,
    marketCap: 14700000000,
    volume24h: 890000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png?1696511893',
  },
  {
    id: 9,
    symbol: 'TRX',
    name: 'TRON',
    price: 0.11,
    change24h: 0.65,
    marketCap: 10000000000,
    volume24h: 420000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png?1696502193',
  },
  {
    id: 10,
    symbol: 'LINK',
    name: 'Chainlink',
    price: 18.27,
    change24h: 5.31,
    marketCap: 10700000000,
    volume24h: 720000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1696502032',
    address: '0x88faA506F21D0C7B0C26e3F60B9Bd0B3D7A0b5e3', // LINK on Base
  },
  {
    id: 11,
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.92,
    change24h: -1.88,
    marketCap: 8500000000,
    volume24h: 560000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/4713/large/polygon.png?1696512008',
  },
  {
    id: 12,
    symbol: 'TON',
    name: 'Toncoin',
    price: 6.24,
    change24h: 2.08,
    marketCap: 21300000000,
    volume24h: 940000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png?1696517160',
  },
  {
    id: 13,
    symbol: 'DOT',
    name: 'Polkadot',
    price: 7.98,
    change24h: -0.42,
    marketCap: 10400000000,
    volume24h: 310000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12171/large/polkadot.png?1696511676',
  },
  {
    id: 14,
    symbol: 'LTC',
    name: 'Litecoin',
    price: 92.17,
    change24h: 1.12,
    marketCap: 6900000000,
    volume24h: 480000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/2/large/litecoin.png?1696501407',
  },
  {
    id: 15,
    symbol: 'ATOM',
    name: 'Cosmos',
    price: 9.63,
    change24h: -3.14,
    marketCap: 3600000000,
    volume24h: 290000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png?1696502670',
  },
  {
    id: 16,
    symbol: 'APT',
    name: 'Aptos',
    price: 12.28,
    change24h: 6.41,
    marketCap: 4970000000,
    volume24h: 410000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/26455/large/Aptos_Non-Gradient_Symbol_Black.png?1696525085',
  },
  {
    id: 17,
    symbol: 'ARB',
    name: 'Arbitrum',
    price: 1.28,
    change24h: -4.53,
    marketCap: 3260000000,
    volume24h: 580000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/30822/large/arb.jpeg?1696528535',
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB on Base
  },
  {
    id: 18,
    symbol: 'OP',
    name: 'Optimism',
    price: 2.11,
    change24h: 3.35,
    marketCap: 3420000000,
    volume24h: 360000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/25244/large/optimism.jpeg?1696524379',
    address: '0x4200000000000000000000000000000000000042', // OP on Base
  },
  {
    id: 19,
    symbol: 'SUI',
    name: 'Sui',
    price: 1.53,
    change24h: 7.12,
    marketCap: 2200000000,
    volume24h: 440000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/25455/large/sui_logo.png?1696524566',
  },
  {
    id: 20,
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    price: 5.62,
    change24h: -2.79,
    marketCap: 5700000000,
    volume24h: 390000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/10365/large/near.jpg?1696514520',
  },
  {
    id: 21,
    symbol: 'INJ',
    name: 'Injective',
    price: 25.31,
    change24h: 4.02,
    marketCap: 2300000000,
    volume24h: 270000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png?1696512132',
  },
  {
    id: 22,
    symbol: 'AAVE',
    name: 'Aave',
    price: 114.58,
    change24h: -0.95,
    marketCap: 1700000000,
    volume24h: 210000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1696511931',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AAVE on Base
  },
  {
    id: 23,
    symbol: 'UNI',
    name: 'Uniswap',
    price: 9.87,
    change24h: 2.18,
    marketCap: 5600000000,
    volume24h: 320000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1696511830',
    address: '0x6fd9d7AD17242c41f7131d257212c54A0e816691', // UNI on Base
  },
  {
    id: 24,
    symbol: 'TIA',
    name: 'Celestia',
    price: 12.7,
    change24h: -5.62,
    marketCap: 2100000000,
    volume24h: 430000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/34666/large/black.png?1708701060',
  },
  {
    id: 25,
    symbol: 'FIL',
    name: 'Filecoin',
    price: 5.98,
    change24h: 1.77,
    marketCap: 3250000000,
    volume24h: 280000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/12817/large/filecoin.png?1696512073',
  },
  {
    id: 26,
    symbol: 'MKR',
    name: 'Maker',
    price: 2834.21,
    change24h: -1.25,
    marketCap: 2580000000,
    volume24h: 150000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502565',
  },
  {
    id: 27,
    symbol: 'RON',
    name: 'Ronin',
    price: 3.21,
    change24h: 5.98,
    marketCap: 1000000000,
    volume24h: 98000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/22756/large/ron.png?1696526487',
  },
  {
    id: 28,
    symbol: 'WIF',
    name: 'dogwifhat',
    price: 2.98,
    change24h: -8.55,
    marketCap: 2900000000,
    volume24h: 520000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.png?1702495089',
  },
  {
    id: 29,
    symbol: 'PEPE',
    name: 'Pepe',
    price: 0.000012,
    change24h: 9.44,
    marketCap: 5000000000,
    volume24h: 680000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528195',
  },
  {
    id: 30,
    symbol: 'FET',
    name: 'Fetch.ai',
    price: 1.62,
    change24h: -6.12,
    marketCap: 1330000000,
    volume24h: 350000000,
    iconUrl:
      'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg?1696505843',
  },
]
