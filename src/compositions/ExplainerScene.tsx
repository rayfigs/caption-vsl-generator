import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
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

export interface ExplainerPoint {
  icon?: string
  heading: string
  body?: string
}

export interface ExplainerSceneProps {
  points: ExplainerPoint[]
  brand?: BrandedTemplateProps
  style: 'list-reveal' | 'card-stack' | 'slide-sequence'
  secondsPerPoint: number
}

export const ExplainerScene: React.FC<ExplainerSceneProps> = ({
  points,
  brand,
  style,
  secondsPerPoint,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const resolvedBrand = resolveBrand(brand)

  if (style === 'card-stack' || style === 'slide-sequence') {
    const pointIndex = Math.min(points.length - 1, Math.floor(frame / (secondsPerPoint * fps)))
    const point = points[pointIndex]
    const pointStartFrame = pointIndex * secondsPerPoint * fps
    const entrance = spring({
      frame: Math.max(0, frame - pointStartFrame),
      fps,
      config: { damping: 18, stiffness: 80, mass: 0.7 },
      durationInFrames: Math.round(fps * 0.6),
    })

    const slideX = style === 'slide-sequence'
      ? interpolate(entrance, [0, 1], [120, 0])
      : 0

    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${resolvedBrand.background} 0%, ${resolvedBrand.accentColor} 160%)`,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14%',
        }}
      >
        <div
          style={{
            opacity: entrance,
            transform: `translateX(${slideX}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {point?.icon ? <div style={{ fontSize: 120, lineHeight: 1 }}>{point.icon}</div> : null}
          <div
            style={{
              color: resolvedBrand.textColor,
              fontSize: 64,
              fontWeight: 700,
              fontFamily: resolvedBrand.headingFont,
              lineHeight: 1.1,
            }}
          >
            {point?.heading}
          </div>
          {point?.body ? (
            <div
              style={{
                color: resolvedBrand.textColor,
                fontSize: 30,
                fontWeight: 400,
                fontFamily: resolvedBrand.bodyFont,
                opacity: 0.78,
                lineHeight: 1.35,
                maxWidth: 760,
              }}
            >
              {point.body}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    )
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: resolvedBrand.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: '20%',
        paddingRight: '20%',
        gap: 28,
      }}
    >
      {points.map((point, index) => {
        const pointFrame = index * secondsPerPoint * fps
        const isActive = frame >= pointFrame

        if (!isActive) return null

        const entrance = spring({
          frame: Math.max(0, frame - pointFrame),
          fps,
          config: { damping: 18, stiffness: 80, mass: 0.7 },
          durationInFrames: Math.round(fps * 0.6),
        })

        const nextPointFrame = (index + 1) * secondsPerPoint * fps
        const isLatest = frame < nextPointFrame || index === points.length - 1
        const dimOpacity = isLatest ? 1 : 0.5

        const slideY = interpolate(entrance, [0, 1], [20, 0])

        return (
          <div
            key={index}
            style={{
              opacity: entrance * dimOpacity,
              transform: `translateY(${slideY}px)`,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            {point.icon ? (
              <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>
                {point.icon}
              </div>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  color: resolvedBrand.textColor,
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: resolvedBrand.headingFont,
                  lineHeight: 1.2,
                }}
              >
                {point.heading}
              </div>
              {point.body ? (
                <div
                  style={{
                    color: resolvedBrand.textColor,
                    fontSize: 24,
                    fontWeight: 400,
                    fontFamily: resolvedBrand.bodyFont,
                    opacity: 0.7,
                    lineHeight: 1.4,
                  }}
                >
                  {point.body}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
