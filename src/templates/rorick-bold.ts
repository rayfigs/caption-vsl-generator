import type { Template } from '../lib/types'

export const rorickBold: Template = {
  id: 'rorick-bold',
  name: 'Rorick Bold (Blue Highlight)',
  brandDefaults: {
    background: '#000000',
    textColor: '#ffffff',
    highlightColor: '#33CCFF',
    secondaryColor: '#000000',
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    logoPosition: 'top-right',
    logoScale: 0.12,
    logoPlacement: 'corner-badge',
    designOverlays: [],
    ctaText: '',
    tagline: '',
  },
  background: {
    type: 'solid',
    color: '#0a0b0d',
    radialGlow: { color: '#D0A169', size: 0.85, opacity: 0.06 },
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 1152,
    height: 400,
    padding: 24,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  text: {
    fontFamily: 'Montserrat',
    fontSize: 90,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1.25,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#ffffff',
    backgroundColor: '#33CCFF',
  },
  canvas: {
    width: 1920,
    height: 1080,
  },
  transitions: {
    segmentIn: 'none',
    segmentOut: 'none',
    duration: 0,
  },
}
