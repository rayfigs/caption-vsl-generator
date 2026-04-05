import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

export interface TitleCardProps {
  title: string
  subtitle?: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  duration: number
  style: 'fade' | 'scale-in' | 'slide-up'
}

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  accentColor,
  fontFamily,
  duration,
  style,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 0.8 },
    durationInFrames: Math.round(fps * 0.8),
  })

  const opacity = style === 'fade'
    ? entrance
    : style === 'scale-in'
      ? entrance
      : interpolate(entrance, [0, 1], [0, 1])

  const scale = style === 'scale-in'
    ? interpolate(entrance, [0, 1], [0.9, 1])
    : 1

  const translateY = style === 'slide-up'
    ? interpolate(entrance, [0, 1], [40, 0])
    : 0

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20%',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            color: textColor,
            fontSize: 80,
            fontWeight: 800,
            fontFamily,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              color: textColor,
              fontSize: 36,
              fontWeight: 400,
              fontFamily,
              textAlign: 'center',
              opacity: 0.6,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  )
}
