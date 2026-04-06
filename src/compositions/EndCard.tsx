import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion'
import type { BrandedTemplateProps } from '../lib/types'

function resolveBrand(brand?: BrandedTemplateProps) {
  return {
    background: brand?.background ?? '#0F172A',
    textColor: brand?.textColor ?? '#ffffff',
    accentColor: brand?.highlightColor ?? brand?.secondaryColor ?? '#2563EB',
    headingFont: brand?.headingFont ?? 'Montserrat',
    bodyFont: brand?.bodyFont ?? brand?.headingFont ?? 'Montserrat',
  }
}

export interface EndCardProps {
  logoUrl?: string
  ctaText: string
  contactLine?: string
  brand?: BrandedTemplateProps
  duration: number
}

export const EndCard: React.FC<EndCardProps> = ({
  logoUrl,
  ctaText,
  contactLine,
  brand,
  duration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const resolvedBrand = resolveBrand(brand)

  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.6 },
    durationInFrames: 15,
  })

  const scale = interpolate(entrance, [0, 1], [0.95, 1])
  const exitOpacity = interpolate(frame, [Math.max(0, duration * fps - 12), duration * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = entrance * exitOpacity

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${resolvedBrand.background} 0%, ${resolvedBrand.accentColor} 180%)`,
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
          color: resolvedBrand.textColor,
          fontSize: 48,
          fontWeight: 700,
          fontFamily: resolvedBrand.headingFont,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {ctaText}
      </div>
      {contactLine ? (
        <div
          style={{
            color: resolvedBrand.textColor,
            fontSize: 28,
            fontWeight: 400,
            fontFamily: resolvedBrand.bodyFont,
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
