import type { Template } from '../lib/types'

export const boldStatement: Template = {
  id: 'bold-statement',
  name: 'Bold Statement',
  brandDefaults: {
    background: '#111827',
    textColor: '#ffffff',
    highlightColor: '#22d3ee',
    secondaryColor: '#0f172a',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-left',
    logoScale: 0.16,
    logoPlacement: 'corner-badge',
    designOverlays: [],
    ctaText: 'Claim Your Offer',
    tagline: 'Clear message, clean execution',
  },
  background: {
    type: 'solid',
    color: '#111827',
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 960,
    height: 320,
    padding: 16,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 72,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1.1,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'line',
    color: '#22d3ee',
  },
  canvas: {
    width: 1080,
    height: 1080,
  },
  transitions: {
    segmentIn: 'slide-up',
    segmentOut: 'fade',
    duration: 0.2,
  },
}
