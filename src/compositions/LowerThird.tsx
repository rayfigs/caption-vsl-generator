import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import type { BrandedTemplateProps } from '../lib/types'

function resolveBrand(brand?: BrandedTemplateProps) {
  return {
    textColor: brand?.textColor ?? '#ffffff',
    accentColor: brand?.highlightColor ?? brand?.secondaryColor ?? '#2563EB',
    bodyFont: brand?.bodyFont ?? brand?.headingFont ?? 'Montserrat',
  }
}

export interface LowerThirdProps {
  name: string
  title?: string
  brand?: BrandedTemplateProps
  enterAt: number
  exitAt: number
  position: 'left' | 'center'
  style: 'slide-up' | 'fade' | 'slide-left'
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  brand,
  enterAt,
  exitAt,
  position,
  style,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const resolvedBrand = resolveBrand(brand)
  const enterFrame = Math.round(enterAt * fps)
  const exitFrame = Math.round(exitAt * fps)

  const enterProgress = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.6 },
    durationInFrames: Math.round(fps * 0.5),
  })

  const exitOpacity = exitAt > 0
    ? interpolate(frame, [exitFrame, exitFrame + Math.round(fps * 0.3)], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  const isVisible = frame >= enterFrame
  if (!isVisible) return null

  const slideY = style === 'slide-up'
    ? interpolate(enterProgress, [0, 1], [30, 0])
    : 0
  const slideX = style === 'slide-left'
    ? interpolate(enterProgress, [0, 1], [-40, 0])
    : 0
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
          opacity: style === 'fade' ? exitOpacity : opacity,
          transform: `translate(${slideX}px, ${slideY}px)`,
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 3,
            backgroundColor: resolvedBrand.accentColor,
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
              color: resolvedBrand.textColor,
              fontSize: 32,
              fontWeight: 700,
              fontFamily: resolvedBrand.bodyFont,
              lineHeight: 1.2,
            }}
          >
            {name}
          </div>
          {title ? (
            <div
              style={{
                color: resolvedBrand.textColor,
                fontSize: 24,
                fontWeight: 400,
                fontFamily: resolvedBrand.bodyFont,
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
