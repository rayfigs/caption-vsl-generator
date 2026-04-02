import type { BrandedTemplateProps, Template } from '../lib/types'

interface DesignOverlaysProps {
  brand: BrandedTemplateProps
  template: Template
}

export const DesignOverlays: React.FC<DesignOverlaysProps> = ({ brand, template }) => {
  const overlays = brand.designOverlays || []
  const accentColor = brand.highlightColor || template.highlight.color || '#FFFFFF'
  const secondaryColor = brand.secondaryColor || accentColor
  const textColor = brand.textColor || template.text.color
  const headingFont = brand.headingFont || brand.bodyFont || template.text.fontFamily

  return (
    <>
      {overlays.includes('gradient-scrim') ? (
        <div
          data-testid="design-overlay-gradient-scrim"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${accentColor}33 0%, transparent 24%, transparent 72%, ${secondaryColor}55 100%)`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {overlays.includes('frame-border') ? (
        <div
          data-testid="design-overlay-frame-border"
          style={{
            position: 'absolute',
            inset: 16,
            border: `4px solid ${accentColor}`,
            borderRadius: 24,
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {overlays.includes('cta-bar') ? (
        <div
          data-testid="design-overlay-cta-bar"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '18px 32px',
            backgroundColor: secondaryColor,
            color: textColor,
            textAlign: 'center',
            fontFamily: headingFont,
            fontSize: 30,
            letterSpacing: 0.5,
          }}
        >
          {brand.ctaText || 'Learn More'}
        </div>
      ) : null}
    </>
  )
}
