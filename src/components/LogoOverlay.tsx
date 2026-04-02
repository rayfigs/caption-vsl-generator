import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { BrandedTemplateProps, LogoCornerPosition, Template } from '../lib/types'

interface LogoOverlayProps {
  brand: BrandedTemplateProps
  template: Template
  audioDuration: number
}

function getCornerStyle(position: LogoCornerPosition, padding: number) {
  switch (position) {
    case 'top-left':
      return { top: padding, left: padding }
    case 'bottom-left':
      return { bottom: padding, left: padding }
    case 'bottom-right':
      return { bottom: padding, right: padding }
    case 'top-right':
    default:
      return { top: padding, right: padding }
  }
}

export const LogoOverlay: React.FC<LogoOverlayProps> = ({ brand, template, audioDuration }) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()

  if (!brand.logoUrl || !brand.logoPlacement) {
    return null
  }

  const opacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const logoWidth = Math.round(width * Math.max(0.1, Math.min(brand.logoScale ?? 0.16, 0.3)))
  const brandFont = brand.headingFont || brand.bodyFont || template.text.fontFamily
  const baseColor = brand.secondaryColor || brand.highlightColor || template.highlight.color || '#FFFFFF'
  const outroStartFrame = Math.max(Math.floor(audioDuration * fps) - fps * 2, 0)

  if (brand.logoPlacement === 'intro-card' && frame < fps) {
    return (
      <AbsoluteFill
        data-testid="logo-overlay-intro-card"
        style={{
          backgroundColor: brand.background || template.background.color || '#000000',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          opacity,
        }}
      >
        <Img src={brand.logoUrl} style={{ width: logoWidth * 1.6, objectFit: 'contain' }} />
        <div style={{ color: brand.textColor || template.text.color, fontFamily: brandFont, fontSize: 42 }}>
          {brand.tagline || template.name}
        </div>
      </AbsoluteFill>
    )
  }

  if (brand.logoPlacement === 'outro-card' && frame >= outroStartFrame) {
    return (
      <AbsoluteFill
        data-testid="logo-overlay-outro-card"
        style={{
          backgroundColor: brand.background || template.background.color || '#000000',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <Img src={brand.logoUrl} style={{ width: logoWidth * 1.8, objectFit: 'contain' }} />
        <div
          style={{
            color: brand.textColor || template.text.color,
            fontFamily: brandFont,
            fontSize: 48,
            textAlign: 'center',
          }}
        >
          {brand.ctaText || 'Learn More'}
        </div>
      </AbsoluteFill>
    )
  }

  if (brand.logoPlacement === 'lower-third') {
    return (
      <div
        data-testid="logo-overlay-lower-third"
        style={{
          position: 'absolute',
          left: 48,
          right: 48,
          bottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '16px 20px',
          borderRadius: 18,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          color: brand.textColor || '#FFFFFF',
          opacity,
        }}
      >
        <Img src={brand.logoUrl} style={{ width: logoWidth * 0.9, objectFit: 'contain' }} />
        <div style={{ fontFamily: brandFont, fontSize: 28 }}>{brand.tagline || template.name}</div>
      </div>
    )
  }

  if (brand.logoPlacement === 'watermark') {
    return (
      <div
        data-testid="logo-overlay-watermark"
        style={{
          position: 'absolute',
          right: 32,
          bottom: 32,
          opacity: 0.18,
        }}
      >
        <Img src={brand.logoUrl} style={{ width: logoWidth, objectFit: 'contain' }} />
      </div>
    )
  }

  return (
    <div
      data-testid="logo-overlay-corner-badge"
      style={{
        position: 'absolute',
        padding: 16,
        borderRadius: 20,
        backgroundColor: `${baseColor}22`,
        opacity,
        ...getCornerStyle(brand.logoPosition || 'top-right', 28),
      }}
    >
      <Img src={brand.logoUrl} style={{ width: logoWidth * 0.8, objectFit: 'contain' }} />
    </div>
  )
}
