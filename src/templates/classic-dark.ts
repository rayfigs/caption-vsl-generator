import type { Template } from '../lib/types'

export const classicDark: Template = {
  id: 'classic-dark',
  name: 'Classic Dark',
  brandDefaults: {
    background: '#050505',
    textColor: '#ffffff',
    highlightColor: '#facc15',
    secondaryColor: '#27272a',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.14,
    logoPlacement: 'corner-badge',
    designOverlays: [],
    ctaText: 'Get Started',
    tagline: 'Built for performance',
  },
  background: {
    type: 'solid',
    color: '#050505',
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 920,
    height: 520,
    padding: 32,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 52,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.35,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#facc15',
  },
  canvas: {
    width: 1080,
    height: 1080,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.3,
  },
}
