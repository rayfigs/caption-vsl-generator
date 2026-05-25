import type { Template } from '../lib/types'

/**
 * Portrait Blur — words focus-pull in from blurry to sharp.
 *
 * Deep near-black background with a cool crimson accent.
 * The blur-in style creates a cinematic, premium reveal — feels expensive.
 *
 * Good for: high-ticket offers, luxury brands, testimonials, VSL openers
 */
export const portraitBlur: Template = {
  id: 'portrait-blur',
  name: 'Portrait Blur (Focus Reveal)',
  brandDefaults: {
    background: '#0c0a0a',
    textColor: '#f8f8f8',
    highlightColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.11,
    designOverlays: [],
  },
  background: {
    type: 'gradient',
    gradient: { from: '#100c0c', to: '#060404', angle: 160 },
  },
  captionBox: {
    x: 'center',
    y: 1305,
    width: 1005,
    height: 295,
    padding: 20,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 96,
    fontWeight: '800',
    color: '#f8f8f8',
    lineHeight: 1.05,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.18,
  },
  animationStyle: 'smooth',
  wordEntry: 'blur-in',
  zones: {
    topBar: {
      height: 5,
      color: '#dc2626',
      opacity: 0.9,
    },
    dividerLine: {
      color: '#dc2626',
      opacity: 0.28,
      yPosition: 1270,
      widthPercent: 78,
    },
    sideAccents: {
      width: 3,
      color: '#dc2626',
      opacity: 0.15,
      heightPercent: 48,
    },
  },
}
