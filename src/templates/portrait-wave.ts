import type { Template } from '../lib/types'

/**
 * Portrait Wave — words bounce in from below with a rolling arc per word.
 *
 * Warm amber/orange accent on deep charcoal. High energy, natural rhythm.
 * The underdamped spring gives each word its own micro-bounce.
 *
 * Good for: fitness, coaching, motivation, product launches
 */
export const portraitWave: Template = {
  id: 'portrait-wave',
  name: 'Portrait Wave (Bounce Entry)',
  brandDefaults: {
    background: '#111010',
    textColor: '#ffffff',
    highlightColor: '#f97316',
    secondaryColor: '#c2410c',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.11,
    designOverlays: [],
  },
  background: {
    type: 'gradient',
    gradient: { from: '#161210', to: '#0a0807', angle: 175 },
  },
  captionBox: {
    x: 'center',
    y: 1295,
    width: 1010,
    height: 300,
    padding: 22,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 98,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 1.03,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    backgroundColor: '#f97316',
    color: '#ffffff',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.12,
  },
  animationStyle: 'bouncy',
  wordEntry: 'wave',
  zones: {
    topBar: {
      height: 7,
      color: '#f97316',
      opacity: 1,
    },
    dividerLine: {
      color: '#f97316',
      opacity: 0.38,
      yPosition: 1258,
      widthPercent: 84,
    },
    sideAccents: {
      width: 4,
      color: '#f97316',
      opacity: 0.22,
      heightPercent: 52,
    },
  },
}
