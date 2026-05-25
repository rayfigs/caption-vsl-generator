import type { Template } from '../lib/types'

/**
 * Portrait Typewriter — words clip in left-to-right, like a cursor typing them.
 *
 * Clean dark background with a green terminal-style accent.
 * Pairs well with instructional, technical, or "here's the truth" copy.
 *
 * Good for: authority content, course ads, info product hooks
 */
export const portraitTypewriter: Template = {
  id: 'portrait-typewriter',
  name: 'Portrait Typewriter (Left Reveal)',
  brandDefaults: {
    background: '#0d1117',
    textColor: '#f0f6fc',
    highlightColor: '#3fb950',
    secondaryColor: '#238636',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.11,
    designOverlays: [],
  },
  background: {
    type: 'gradient',
    gradient: { from: '#0d1117', to: '#010409', angle: 180 },
  },
  captionBox: {
    x: 'center',
    y: 1300,
    width: 1000,
    height: 310,
    padding: 20,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 94,
    fontWeight: '800',
    color: '#f0f6fc',
    lineHeight: 1.05,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    backgroundColor: '#3fb950',
    color: '#0d1117',
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
  animationStyle: 'snappy',
  wordEntry: 'typewriter',
  zones: {
    topBar: {
      height: 5,
      color: '#3fb950',
      opacity: 1,
    },
    dividerLine: {
      color: '#3fb950',
      opacity: 0.3,
      yPosition: 1265,
      widthPercent: 82,
    },
    sideAccents: {
      width: 3,
      color: '#3fb950',
      opacity: 0.2,
      heightPercent: 52,
    },
  },
}
