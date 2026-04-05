import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion'

export interface EndCardProps {
  logoUrl?: string
  ctaText: string
  contactLine?: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
}

export const EndCard: React.FC<EndCardProps> = ({
  logoUrl,
  ctaText,
  contactLine,
  backgroundColor,
  textColor,
  accentColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.6 },
    durationInFrames: 15,
  })

  const scale = interpolate(entrance, [0, 1], [0.95, 1])
  const opacity = entrance

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20%',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {logoUrl ? (
        <Img
          src={logoUrl}
          style={{
            maxWidth: '30%',
            objectFit: 'contain',
            marginBottom: 40,
          }}
        />
      ) : null}
      <div
        style={{
          color: textColor,
          fontSize: 48,
          fontWeight: 700,
          fontFamily,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {ctaText}
      </div>
      {contactLine ? (
        <div
          style={{
            color: textColor,
            fontSize: 28,
            fontWeight: 400,
            fontFamily,
            textAlign: 'center',
            opacity: 0.6,
            marginTop: 'auto',
            lineHeight: 1.3,
          }}
        >
          {contactLine}
        </div>
      ) : null}
    </AbsoluteFill>
  )
}
