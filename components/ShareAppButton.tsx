import { useComposeCast } from '@coinbase/onchainkit/minikit'

interface ShareAppButtonProps {
  text: string
  embedLink: string
  buttonText: string
  className?: string
}

export default function ShareAppButton({
  text,
  embedLink,
  buttonText,
}: ShareAppButtonProps) {
  const { composeCast } = useComposeCast()

  const handleComposeWithEmbed = () => {
    composeCast({
      text,
      embeds: [embedLink],
    })
  }

  return <button onClick={handleComposeWithEmbed}>{buttonText}</button>
}
