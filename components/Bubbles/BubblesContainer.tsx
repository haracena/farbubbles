'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Bubble from './Bubble'
import Matter, {
  Engine,
  World,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
} from 'matter-js'
import { Token } from '@/interfaces/Token'
import BubbleModal from './BubbleModal'
import { useTokens } from '@/hooks/useTokens'

interface BubblesContainerProps {
  maxBubbles?: number
}

interface BubbleState {
  id: string
  size: number
  symbol: string
  name: string
  price: number | null
  changePercent: number | null
  marketCap: number | null
  volume24h: number | null
  image: string
  x: number
  y: number
}

export default function BubblesContainer({
  maxBubbles = 50,
}: BubblesContainerProps) {
  const { data: clankerTokens, isLoading, error } = useTokens() // GeckoTerminal uses pagination, not limit

  const [bubbles, setBubbles] = useState<BubbleState[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [sizeCriteria, setSizeCriteria] = useState<
    'marketCap' | '24h' | '6h' | '1h'
  >('marketCap')
  const engineRef = useRef<Engine | null>(null)
  const bodiesRef = useRef<Body[]>([])
  const animationFrameRef = useRef<number | undefined>(
    undefined as number | undefined,
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const isPausedRef = useRef<boolean>(false)

  // Registrar refs de las burbujas para poder actualizar su posición sin re-renderizar
  const registerBubbleRef = useCallback((id: string) => {
    return (node: HTMLDivElement | null) => {
      if (node) {
        bubbleElementsRef.current.set(id, node)
      } else {
        bubbleElementsRef.current.delete(id)
      }
    }
  }, [])

  // Inicializar Matter.js y las burbujas
  useEffect(() => {
    if (!clankerTokens || clankerTokens.length === 0) return

    const BOTTOM_OFFSET = 88
    const width = window.innerWidth
    const height = window.innerHeight - BOTTOM_OFFSET
    const engine = Engine.create()
    engine.world.gravity.y = 0 // Gravedad suave hacia abajo
    engine.world.gravity.x = 0 // Sin gravedad horizontal
    engineRef.current = engine

    // Crear límites del contenedor
    const wallThickness = 200
    const walls = [
      // top
      Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
      }),
      // bottom
      Bodies.rectangle(
        width / 2,
        height + wallThickness / 2,
        width,
        wallThickness,
        { isStatic: true },
      ),
      // left
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
      }),
      // right
      Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        { isStatic: true },
      ),
    ]
    World.add(engine.world, walls)

    // Calcular área total y followers (escala logarítmica)
    const totalArea = width * height
    const usedArea = totalArea * 0.9
    const minSize = Math.max(28, width * 0.08) // 8% del ancho, mínimo 28px
    const maxSize = Math.max(56, width * 0.42) // 42% del ancho, mínimo 56px
    const tokens = clankerTokens.slice(0, maxBubbles)
    const marketCaps = tokens
      .map((t) => t.marketCap)
      .filter((cap): cap is number => cap !== null)
    if (marketCaps.length === 0) return
    const minMarketCap = Math.min(...marketCaps)
    const maxMarketCap = Math.max(...marketCaps)

    const padding = 10
    const minX = padding
    const maxX = width - padding
    const minY = padding
    const maxY = height - padding

    const tokenSizes = tokens.map((token) => {
      let value: number
      let minValue: number
      let maxValue: number

      // Determine value based on criteria
      if (sizeCriteria === 'marketCap') {
        if (!token.marketCap) return { token, baseSize: minSize }
        value = token.marketCap
        minValue = minMarketCap
        maxValue = maxMarketCap
      } else if (sizeCriteria === '24h') {
        const change = token.change['24h']
        if (change === null) return { token, baseSize: minSize }
        value = Math.abs(change) // Use absolute value
        const changes = tokens
          .map((t) => t.change['24h'])
          .filter((c): c is number => c !== null)
          .map(Math.abs)
        minValue = Math.min(...changes)
        maxValue = Math.max(...changes)
      } else if (sizeCriteria === '6h') {
        const change = token.change['6h']
        if (change === null) return { token, baseSize: minSize }
        value = Math.abs(change)
        const changes = tokens
          .map((t) => t.change['6h'])
          .filter((c): c is number => c !== null)
          .map(Math.abs)
        minValue = Math.min(...changes)
        maxValue = Math.max(...changes)
      } else {
        // '1h'
        const change = token.change['1h']
        if (change === null) return { token, baseSize: minSize }
        value = Math.abs(change)
        const changes = tokens
          .map((t) => t.change['1h'])
          .filter((c): c is number => c !== null)
          .map(Math.abs)
        minValue = Math.min(...changes)
        maxValue = Math.max(...changes)
      }

      if (maxValue === minValue) {
        return { token, baseSize: minSize }
      }

      // Use log scale for market cap, linear for percentage changes
      let normalizedValue: number
      if (sizeCriteria === 'marketCap') {
        const logValue = Math.log10(value)
        const minLog = Math.log10(minValue)
        const maxLog = Math.log10(maxValue)
        normalizedValue = (logValue - minLog) / (maxLog - minLog)
      } else {
        normalizedValue = (value - minValue) / (maxValue - minValue)
      }

      const baseSize = minSize + normalizedValue * (maxSize - minSize)
      return { token, baseSize }
    })

    const totalBubbleArea = tokenSizes.reduce((acc, { baseSize }) => {
      const radius = baseSize / 2
      return acc + Math.PI * radius * radius
    }, 0)

    const scaleFactor =
      totalBubbleArea === 0 ? 1 : Math.sqrt(usedArea / totalBubbleArea)

    const tokenBubbles = tokenSizes.map(({ token, baseSize }) => {
      const scaledSize = baseSize * scaleFactor
      const size = Math.max(minSize, Math.min(maxSize, scaledSize))
      // Posición inicial aleatoria dentro del área visible
      const x = Math.random() * (maxX - minX - size) + minX + size / 2
      const y = Math.random() * (maxY - minY - size) + minY + size / 2
      const visualRadius = size / 2
      const physicsRadius = visualRadius * 0.85 // 15% más pequeño para permitir solapamiento
      const body = Bodies.circle(x, y, physicsRadius, {
        restitution: 0.2, // rebote muy suave
        friction: 0,
        frictionAir: 0.015, // más resistencia para movimientos más lentos
        density: 0.001, // burbujas muy livianas
        label: String(token.id),
      })
      // Ajustar la masa: hacerlas más livianas para colisiones suaves
      const area = Math.PI * physicsRadius * physicsRadius
      Matter.Body.setMass(body, area * 0.5) // masa más ligera
      // Darles un empujón inicial suave
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
      })
      return { token, body, size }
    })
    bodiesRef.current = tokenBubbles.map((b) => b.body)
    World.add(engine.world, bodiesRef.current)

    // Get the change value based on current criteria
    const getChangeValue = (token: (typeof tokens)[0]) => {
      if (sizeCriteria === '1h') return token.change['1h']
      if (sizeCriteria === '6h') return token.change['6h']
      return token.change['24h']
    }

    setBubbles(
      tokenBubbles.map(({ token, body, size }) => ({
        id: token.id,
        size,
        symbol: token.symbol,
        name: token.name,
        price: token.price,
        changePercent: getChangeValue(token),
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        image: token.image,
        x: body.position.x - size / 2,
        y: body.position.y - size / 2,
      })),
    )

    // MouseConstraint para arrastrar burbujas
    if (containerRef.current) {
      const mouse = Mouse.create(containerRef.current)
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.0001, // más suave para arrastre
          render: { visible: false },
        },
      })
      World.add(engine.world, mouseConstraint)
    }

    // Animar y sincronizar con React
    const update = () => {
      // Pausar animación si el modal está abierto
      if (isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(update)
        return
      }

      // Movimiento constante: fuerza aleatoria independiente para cada burbuja
      const forceMagnitude = 0.08 // fuerza reducida para movimientos más lentos
      bodiesRef.current.forEach((body) => {
        const angle = Math.random() * 2 * Math.PI
        Matter.Body.applyForce(body, body.position, {
          x: Math.cos(angle) * forceMagnitude,
          y: Math.sin(angle) * forceMagnitude,
        })
      })
      Engine.update(engine, 1000 / 60)
      tokenBubbles.forEach(({ token, body, size }) => {
        const node = bubbleElementsRef.current.get(token.id)
        if (!node) return
        const xPos = body.position.x - size / 2
        const yPos = body.position.y - size / 2
        node.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) scale(1)`
      })
      animationFrameRef.current = requestAnimationFrame(update)
    }
    update()

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
      World.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [maxBubbles, sizeCriteria, clankerTokens])

  // Efecto para pausar/reanudar animación cuando el modal se abre/cierra
  useEffect(() => {
    isPausedRef.current = selectedToken !== null
  }, [selectedToken])

  const handleBubbleClick = useCallback(
    (bubbleId: string) => {
      if (!clankerTokens) return
      const token = clankerTokens.find((t) => t.id === bubbleId)
      if (token) {
        setSelectedToken(token)
      }
    },
    [clankerTokens],
  )

  return (
    <>
      {isLoading || !clankerTokens ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="animate-pulse text-neutral-400">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-red-400">Error loading tokens</div>
        </div>
      ) : (
        <>
          {/* Size Criteria Selector */}
          <div
            className="fixed top-2 left-1/2 z-50 flex w-max -translate-x-1/2 gap-1 rounded-full bg-neutral-800/90 p-1"
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {[
              { value: 'marketCap' as const, label: 'Market Cap' },
              { value: '24h' as const, label: '24h %' },
              { value: '6h' as const, label: '6h %' },
              { value: '1h' as const, label: '1h %' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSizeCriteria(option.value)}
                className={`rounded-full px-2 py-2 text-xs font-medium transition-colors ${
                  sizeCriteria === option.value
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div
            ref={containerRef}
            className="relative h-screen w-full overflow-hidden pt-10"
          >
            {/* Burbujas */}
            {bubbles.map((bubble) => (
              <Bubble
                key={bubble.id}
                id={bubble.id}
                size={bubble.size}
                symbol={bubble.symbol}
                change24h={bubble.changePercent}
                iconUrl={bubble.image}
                x={bubble.x}
                y={bubble.y}
                onBubbleClick={handleBubbleClick}
                ref={registerBubbleRef(bubble.id)}
              />
            ))}

            {/* Información del usuario seleccionado */}
            {selectedToken && (
              <BubbleModal
                selectedToken={selectedToken}
                onClose={() => setSelectedToken(null)}
              />
            )}
          </div>
        </>
      )}
    </>
  )
}
