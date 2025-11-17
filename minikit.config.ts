const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: '',
    payload: '',
    signature: '',
  },
  miniapp: {
    version: '1',
    name: 'Base Bubbles',
    subtitle: 'Interactive token bubbles with instant swaps',
    description:
      'Explore Base tokens in a playful physics-based interface. Click bubbles to view token details and swap instantly using 0x protocol. Discover trending tokens from the Base ecosystem in a unique interactive experience.',
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.webp`,
    splashImageUrl: `${ROOT_URL}/hero.png`,
    splashBackgroundColor: '#0a0a0a',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'finance',
    tags: ['defi', 'tokens', 'swap', 'base', 'interactive'],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: 'Trade tokens through interactive bubbles',
    ogTitle: 'Base Bubbles - Interactive Token Trading on Base',
    ogDescription:
      'Explore and swap Base tokens through an immersive physics-based bubble interface. Click any bubble to view token details and execute instant swaps powered by 0x protocol.',
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const
