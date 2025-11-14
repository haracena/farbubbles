"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Bubble from "./Bubble";
import Matter, {
  Engine,
  World,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
} from "matter-js";
import { Token } from "@/interfaces/Token";
import { mockTokens } from "@/mock/tokens";
import BubbleModal from "./BubbleModal";

interface BubblesContainerProps {
  maxBubbles?: number;
}

interface BubbleState {
  id: number;
  size: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  iconUrl: string;
  x: number;
  y: number;
}

export default function BubblesContainer({
  maxBubbles = 50,
}: BubblesContainerProps) {
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const bodiesRef = useRef<Body[]>([]);
  const animationFrameRef = useRef<number | undefined>(
    undefined as number | undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  console.log(selectedToken);

  // Registrar refs de las burbujas para poder actualizar su posición sin re-renderizar
  const registerBubbleRef = useCallback((id: number) => {
    return (node: HTMLDivElement | null) => {
      if (node) {
        bubbleElementsRef.current.set(id, node);
      } else {
        bubbleElementsRef.current.delete(id);
      }
    };
  }, []);

  // Inicializar Matter.js y las burbujas
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const engine = Engine.create();
    engine.world.gravity.y = 0; // Gravedad suave hacia abajo
    engine.world.gravity.x = 0; // Sin gravedad horizontal
    engineRef.current = engine;

    // Crear límites del contenedor
    const wallThickness = 200;
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
        { isStatic: true }
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
        { isStatic: true }
      ),
    ];
    World.add(engine.world, walls);

    // Calcular área total y followers (escala logarítmica)
    const totalArea = width * height;
    const usedArea = totalArea * 0.9;
    const minSize = Math.max(28, width * 0.08); // 8% del ancho, mínimo 28px
    const maxSize = Math.max(56, width * 0.42); // 42% del ancho, mínimo 56px
    const tokens = mockTokens.slice(0, maxBubbles);
    const minMarketCap = Math.min(...tokens.map((t) => t.marketCap));
    const maxMarketCap = Math.max(...tokens.map((t) => t.marketCap));

    const padding = 10;
    const minX = padding;
    const maxX = width - padding;
    const minY = padding;
    const maxY = height - padding;

    const tokenSizes = tokens.map((token) => {
      if (maxMarketCap === minMarketCap) {
        return { token, baseSize: minSize };
      }
      const logCap = Math.log10(token.marketCap);
      const minLog = Math.log10(minMarketCap);
      const maxLog = Math.log10(maxMarketCap);
      const baseSize =
        minSize + ((logCap - minLog) * (maxSize - minSize)) / (maxLog - minLog);
      return { token, baseSize };
    });

    const totalBubbleArea = tokenSizes.reduce((acc, { baseSize }) => {
      const radius = baseSize / 2;
      return acc + Math.PI * radius * radius;
    }, 0);

    const scaleFactor =
      totalBubbleArea === 0 ? 1 : Math.sqrt(usedArea / totalBubbleArea);

    const tokenBubbles = tokenSizes.map(({ token, baseSize }) => {
      const scaledSize = baseSize * scaleFactor;
      const size = Math.max(minSize, Math.min(maxSize, scaledSize));
      // Posición inicial aleatoria dentro del área visible
      const x = Math.random() * (maxX - minX - size) + minX + size / 2;
      const y = Math.random() * (maxY - minY - size) + minY + size / 2;
      const visualRadius = size / 2;
      const physicsRadius = visualRadius * 0.85; // 15% más pequeño para permitir solapamiento
      const body = Bodies.circle(x, y, physicsRadius, {
        restitution: 0.2, // rebote muy suave
        friction: 0,
        frictionAir: 0.015, // más resistencia para movimientos más lentos
        density: 0.001, // burbujas muy livianas
        label: String(token.id),
      });
      // Ajustar la masa: hacerlas más livianas para colisiones suaves
      const area = Math.PI * physicsRadius * physicsRadius;
      Matter.Body.setMass(body, area * 0.5); // masa más ligera
      // Darles un empujón inicial suave
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
      });
      return { token, body, size };
    });
    bodiesRef.current = tokenBubbles.map((b) => b.body);
    World.add(engine.world, bodiesRef.current);

    setBubbles(
      tokenBubbles.map(({ token, body, size }) => ({
        id: token.id,
        size,
        symbol: token.symbol,
        name: token.name,
        price: token.price,
        change24h: token.change24h,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        iconUrl: token.iconUrl,
        x: body.position.x - size / 2,
        y: body.position.y - size / 2,
      }))
    );

    // MouseConstraint para arrastrar burbujas
    if (containerRef.current) {
      const mouse = Mouse.create(containerRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.0001, // más suave para arrastre
          render: { visible: false },
        },
      });
      World.add(engine.world, mouseConstraint);
    }

    // Animar y sincronizar con React
    const update = () => {
      // Movimiento constante: fuerza aleatoria independiente para cada burbuja
      const forceMagnitude = 0.12; // fuerza reducida para movimientos más lentos
      bodiesRef.current.forEach((body) => {
        const angle = Math.random() * 2 * Math.PI;
        Matter.Body.applyForce(body, body.position, {
          x: Math.cos(angle) * forceMagnitude,
          y: Math.sin(angle) * forceMagnitude,
        });
      });
      Engine.update(engine, 1000 / 60);
      tokenBubbles.forEach(({ token, body, size }) => {
        const node = bubbleElementsRef.current.get(token.id);
        if (!node) return;
        const xPos = body.position.x - size / 2;
        const yPos = body.position.y - size / 2;
        node.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) scale(1)`;
      });
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [maxBubbles]);

  const handleBubbleClick = useCallback((bubbleId: number) => {
    const token = mockTokens.find((t) => t.id === bubbleId);
    if (token) {
      setSelectedToken(token);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-neutral-900"
    >
      {/* Burbujas */}
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          size={bubble.size}
          symbol={bubble.symbol}
          change24h={bubble.change24h}
          iconUrl={bubble.iconUrl}
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
  );
}
