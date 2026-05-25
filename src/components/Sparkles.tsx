import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

interface SparklesProps {
  color?: string
  count?: number
}

/**
 * Floating sparkle particles that drift across the frame.
 * Each particle has a randomized position, size, drift speed, and phase
 * so they feel organic. Opacity pulses in and out on a sine wave.
 */
export const Sparkles: React.FC<SparklesProps> = ({ color = '#D0A169', count = 18 }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  // Deterministic pseudo-random from index (no Math.random in Remotion)
  const seed = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
  }

  const particles = Array.from({ length: count }, (_, i) => {
    const startX = seed(i) * width
    const startY = seed(i + 50) * height
    const size = 3 + seed(i + 100) * 5
    const speed = 0.3 + seed(i + 150) * 0.5
    const phase = seed(i + 200) * Math.PI * 2
    const driftX = Math.sin(t * speed + phase) * 30
    const driftY = -t * (8 + seed(i + 250) * 12) % height

    // Wrap Y so particles reappear from bottom
    const y = ((startY + driftY) % height + height) % height
    const x = startX + driftX

    // Pulse opacity on a sine wave
    const pulse = Math.sin(t * (1.5 + seed(i + 300)) + phase)
    const opacity = interpolate(pulse, [-1, 1], [0, 0.5])

    return { x, y, size, opacity }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${color}, 0 0 ${p.size * 6}px ${color}44`,
          }}
        />
      ))}
    </div>
  )
}
