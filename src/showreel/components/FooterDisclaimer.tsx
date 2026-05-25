import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface FooterDisclaimerProps {
  text: string
  /** Delay in frames before animating in */
  delay?: number
}

export const FooterDisclaimer: React.FC<FooterDisclaimerProps> = ({
  text,
  delay = 20,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 32, stiffness: 280, mass: 0.7 },
  })
  const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(s, [0, 1], [24, 0], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      position: 'absolute',
      left: 40,
      right: 40,
      bottom: 44,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Safe zone indicator line */}
      <div style={{
        height: 2,
        backgroundColor: BRAND.orange,
        marginBottom: 10,
        borderRadius: 2,
        opacity: 0.6,
      }} />
      <div style={{
        minHeight: 88,
        padding: '14px 20px',
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.78)',
        color: BRAND.white,
        fontSize: 22,
        fontFamily: BRAND.font,
        fontWeight: '500',
        lineHeight: 1.35,
        textAlign: 'center',
        border: `1px solid rgba(255,255,255,0.12)`,
      }}>
        {/* DISCLAIMER tag */}
        <span style={{
          display: 'inline-block',
          backgroundColor: BRAND.orange,
          color: '#000',
          fontSize: 16,
          fontWeight: '800',
          padding: '2px 10px',
          borderRadius: 6,
          marginRight: 10,
          verticalAlign: 'middle',
          letterSpacing: '0.5px',
        }}>DISCLAIMER</span>
        {text}
      </div>
    </div>
  )
}
