import type { Template } from '../lib/types'

export const classicPurple: Template = {
  id: 'classic-purple',
  name: 'Classic Purple (TFD)',
  brandDefaults: {
    background: '#3B0B5E',
    textColor: '#FFFFFF',
    highlightColor: '#FFD700',
    secondaryColor: '#7E22CE',
    headingFont: 'Helvetica Neue',
    bodyFont: 'Helvetica Neue',
    logoPosition: 'top-right',
    logoScale: 0.16,
    logoPlacement: 'corner-badge',
    designOverlays: [],
    ctaText: 'Learn More',
    tagline: 'Brand message here',
  },
  background: {
    type: 'solid',
    color: '#3B0B5E',
  },
  captionBox: {
    x: 80,
    y: 'center',
    width: 920,
    height: 600,
    padding: 20,
  },
  text: {
    fontFamily: 'Helvetica Neue',
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#FFD700',
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
