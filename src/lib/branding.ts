import type { BrandedTemplateProps, Template } from './types'

export interface ResolvedBranding {
  template: Template
  brand: BrandedTemplateProps
}

function mergeBrandProps(
  defaults: BrandedTemplateProps,
  brand?: BrandedTemplateProps
): BrandedTemplateProps {
  return {
    ...defaults,
    ...brand,
    designOverlays: brand?.designOverlays ?? defaults.designOverlays ?? [],
  }
}

export function applyBrandingToTemplate(
  template: Template,
  brand?: BrandedTemplateProps
): ResolvedBranding {
  const resolvedBrand = mergeBrandProps(template.brandDefaults, brand)
  const backgroundColor = resolvedBrand.background || template.background.color
  const secondaryColor = resolvedBrand.secondaryColor || resolvedBrand.highlightColor

  return {
    brand: resolvedBrand,
    template: {
      ...template,
      background: {
        ...template.background,
        color: backgroundColor,
        gradient: template.background.gradient
          ? {
              ...template.background.gradient,
              from: backgroundColor || template.background.gradient.from,
              to: secondaryColor || template.background.gradient.to,
            }
          : template.background.gradient,
      },
      text: {
        ...template.text,
        color: resolvedBrand.textColor || template.text.color,
        fontFamily: resolvedBrand.bodyFont || template.text.fontFamily,
      },
      highlight: {
        ...template.highlight,
        // highlightColor drives the background box behind the active word.
        // highlight.color is the text colour shown ON TOP of that box.
        // If the template sets an explicit highlight.color (e.g. '#000000'),
        // keep it — otherwise default to black so text reads on any bright highlight.
        backgroundColor: resolvedBrand.highlightColor || template.highlight.backgroundColor,
        color: template.highlight.color || '#000000',
      },
    },
  }
}
