import type { Template } from '../lib/types'

/**
 * Portrait Tumble — alternating rotation per word, lower-third anchor.
 *
 * Each word alternates tilt direction (right/left) as it enters.
 * Creates a chaotic-but-controlled kinematic feel, good for energetic content.
 *
 * Good for: hype content, sports, fitness, action-focused messaging
 */
export const portraitTumble: Template = {
  id: 'portrait-tumble',
  name: 'Portrait Tumble (Alternating Rotation)',
  brandDefaults: {
    background: '#0f0f0f',
    textColor: '#ffffff',
    highlightColor: '#facc15',
    secondaryColor: '#eab308',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.12,
    designOverlays: [],
  },
  background: {
    type: 'gradient',
    gradient: { from: '#111111', to: '#0a0a0a', angle: 180 },
  },
  captionBox: {
    x: 'center',
    y: 1290,          // Bottom 33% of 1920px
    width: 1020,
    height: 300,
    padding: 24,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 100,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 1.0,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    backgroundColor: '#facc15',
    color: '#000000',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.1,
  },
  animationStyle: 'bouncy',
  wordEntry: 'tumble',
  zones: {
    topBar: {
      height: 8,
      color: '#facc15',
      opacity: 1,
    },
    dividerLine: {
      color: '#facc15',
      opacity: 0.35,
      yPosition: 1255,
      widthPercent: 80,
    },
    sideAccents: {
      width: 5,
      color: '#facc15',
      opacity: 0.2,
      heightPercent: 50,
    },
  },
}
