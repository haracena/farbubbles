import { useComposeCast } from '@coinbase/onchainkit/minikit'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
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

  return (
    <button
      className="cursor-pointer rounded-lg border border-neutral-600 px-4 py-2 transition-all hover:border-neutral-500"
      onClick={handleComposeWithEmbed}
    >
      <AnimatedShinyText>{buttonText}</AnimatedShinyText>
    </button>
  )
}
