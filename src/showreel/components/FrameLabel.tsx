import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface FrameLabelProps {
  text: string
  /** 'top-left' (default) or 'top-right' */
  position?: 'top-left' | 'top-right'
  accentColor?: string
}

export const FrameLabel: React.FC<FrameLabelProps> = ({
  text,
  position = 'top-left',
  accentColor = BRAND.purple,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const s = spring({ frame, fps, config: { damping: 28, stiffness: 320, mass: 0.6 } })
  const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const translateX = interpolate(
    s, [0, 1],
    [position === 'top-left' ? -40 : 40, 0],
    { extrapolateRight: 'clamp' }
  )

  return (
    <div style={{
      position: 'absolute',
      top: 52,
      ...(position === 'top-left' ? { left: 44 } : { right: 44 }),
      opacity,
      transform: `translateX(${translateX}px)`,
    }}>
      {/* Accent bar */}
      <div style={{
        width: 5,
        height: '100%',
        position: 'absolute',
        left: position === 'top-left' ? -14 : undefined,
        right: position === 'top-right' ? -14 : undefined,
        top: 0,
        backgroundColor: accentColor,
        borderRadius: 3,
      }} />
      <div style={{
        padding: '14px 22px',
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(8px)',
        color: BRAND.white,
        fontSize: 32,
        fontFamily: BRAND.font,
        fontWeight: BRAND.fontWeight,
        letterSpacing: '-0.5px',
        border: `1.5px solid ${accentColor}33`,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ color: accentColor, marginRight: 10, fontSize: 26 }}>▶</span>
        {text}
      </div>
    </div>
  )
}
