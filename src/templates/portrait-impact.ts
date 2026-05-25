import type { Template } from '../lib/types'

/**
 * Portrait Impact — full-center stage layout.
 *
 * Canvas split:
 *   Full canvas: stark black background
 *   Center: massive text (120px), pops in with bouncy spring
 *   Frame lines: thin horizontal bars above and below text area
 *   Side accents: orange vertical bars on edges
 *
 * Good for: power hooks, single-word emphasis, high-stakes statements
 */
export const portraitImpact: Template = {
  id: 'portrait-impact',
  name: 'Portrait Impact (Full Stage)',
  brandDefaults: {
    background: '#000000',
    textColor: '#ffffff',
    highlightColor: '#f97316',
    secondaryColor: '#ea580c',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-left',
    logoScale: 0.1,
    designOverlays: [],
  },
  background: {
    type: 'solid',
    color: '#000000',
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 980,
    height: 320,
    padding: 28,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 120,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 1.0,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#f97316',
    backgroundColor: undefined,
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.08,
  },
  animationStyle: 'bouncy',
  wordEntry: 'pop',
  zones: {
    frameLines: {
      color: '#f97316',
      opacity: 0.6,
      yOffset: 190,
      widthPercent: 78,
    },
    sideAccents: {
      width: 6,
      color: '#f97316',
      opacity: 0.4,
      heightPercent: 45,
    },
  },
}
