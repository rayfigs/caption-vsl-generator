import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface CitationFootnoteProps {
  marker: string
  text: string
  delay?: number
}

export const CitationFootnote: React.FC<CitationFootnoteProps> = ({
  marker,
  text,
  delay = 25,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 30, stiffness: 300, mass: 0.65 },
  })
  const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const translateX = interpolate(s, [0, 1], [32, 0], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      position: 'absolute',
      right: 36,
      bottom: 160,
      maxWidth: 540,
      opacity,
      transform: `translateX(${translateX}px)`,
    }}>
      <div style={{
        padding: '14px 18px',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.93)',
        color: '#111',
        fontSize: 21,
        fontFamily: BRAND.font,
        fontWeight: '600',
        lineHeight: 1.25,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        borderLeft: `4px solid ${BRAND.purple}`,
      }}>
        <span style={{ color: BRAND.purple, fontWeight: '800', marginRight: 8 }}>{marker}</span>
        {text}
      </div>
    </div>
  )
}
