import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import type { BrandedTemplateProps } from '../lib/types'

function resolveBrand(brand?: BrandedTemplateProps) {
  return {
    background: brand?.background ?? '#111827',
    textColor: brand?.textColor ?? '#ffffff',
    accentColor: brand?.highlightColor ?? brand?.secondaryColor ?? '#2563EB',
    headingFont: brand?.headingFont ?? 'Montserrat',
    bodyFont: brand?.bodyFont ?? brand?.headingFont ?? 'Montserrat',
  }
}

export interface TitleCardProps {
  title: string
  subtitle?: string
  brand?: BrandedTemplateProps
  duration: number
  style: 'fade' | 'scale-in' | 'slide-up' | 'wipe'
}

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  brand,
  duration,
  style,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const resolvedBrand = resolveBrand(brand)

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
  const wipeScale = style === 'wipe'
    ? interpolate(entrance, [0, 1], [0, 1])
    : 1
  const exitOpacity = interpolate(frame, [Math.max(0, duration * fps - 12), duration * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${resolvedBrand.background} 0%, ${resolvedBrand.accentColor} 140%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20%',
      }}
    >
      <div
        style={{
          opacity: opacity * exitOpacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          maxWidth: 720,
        }}
      >
        {style === 'wipe' ? (
          <div
            style={{
              position: 'absolute',
              inset: '-12%',
              backgroundColor: resolvedBrand.accentColor,
              transform: `scaleX(${wipeScale})`,
              transformOrigin: 'left center',
              opacity: 0.18,
            }}
          />
        ) : null}
        <div
          style={{
            color: resolvedBrand.textColor,
            fontSize: 80,
            fontWeight: 800,
            fontFamily: resolvedBrand.headingFont,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              color: resolvedBrand.textColor,
              fontSize: 36,
              fontWeight: 400,
              fontFamily: resolvedBrand.bodyFont,
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
