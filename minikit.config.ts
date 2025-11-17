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
    header:
      'eyJmaWQiOjExMDg0NTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhFZWJEYjE5MzgyNjE3QTVmY2YzNDIzNTM1MDc0RTUxMkJEM0MzOGEyIn0',
    payload: 'eyJkb21haW4iOiJ3d3cuYmFzZWJ1YmJsZXMueHl6In0',
    signature:
      '02DsQ7BDeJ0lAx+5wW0OHeIBlz83cWXFe7uVzKjS5xIOkdHyrrPZkISvbpVoFhSRLHHkhCftqphlis5Etcl7Dxs=',
  },
  miniapp: {
    version: '1',
    name: 'Base Bubbles',
    subtitle: 'Trade tokens through bubbles 🫧',
    description:
      'Trade Base tokens through interactive bubbles. Click any bubble to view details and swap instantly',
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.webp`,
    splashImageUrl: `${ROOT_URL}/hero.png`,
    splashBackgroundColor: '#0a0a0a',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'finance',
    tags: ['defi', 'tokens', 'swap', 'base', 'interactive'],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: 'Trade tokens through bubbles',
    ogTitle: 'Bubbles & Swaps on Base 🫧',
    ogDescription:
      'Trade Base tokens through interactive bubbles. Click any bubble to view details and swap instantly',
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const
