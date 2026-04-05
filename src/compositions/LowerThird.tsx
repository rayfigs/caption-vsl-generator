import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

export interface LowerThirdProps {
  name: string
  title?: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  enterAt: number
  exitAt: number
  position: 'left' | 'center'
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  backgroundColor,
  textColor,
  accentColor,
  fontFamily,
  enterAt,
  exitAt,
  position,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enterProgress = spring({
    frame: Math.max(0, frame - enterAt),
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.6 },
    durationInFrames: Math.round(fps * 0.5),
  })

  const exitOpacity = exitAt > 0
    ? interpolate(frame, [exitAt, exitAt + Math.round(fps * 0.3)], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  const isVisible = frame >= enterAt
  if (!isVisible) return null

  const slideY = interpolate(enterProgress, [0, 1], [30, 0])
  const opacity = enterProgress * exitOpacity

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: position === 'center' ? 'center' : 'flex-start',
        paddingBottom: '12%',
        paddingLeft: position === 'left' ? '5%' : 0,
        paddingRight: position === 'left' ? '5%' : 0,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${slideY}px)`,
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 3,
            backgroundColor: accentColor,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 24px',
            gap: 4,
          }}
        >
          <div
            style={{
              color: textColor,
              fontSize: 32,
              fontWeight: 700,
              fontFamily,
              lineHeight: 1.2,
            }}
          >
            {name}
          </div>
          {title ? (
            <div
              style={{
                color: textColor,
                fontSize: 24,
                fontWeight: 400,
                fontFamily,
                opacity: 0.7,
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  )
}
