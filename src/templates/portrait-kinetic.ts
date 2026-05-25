import type { Template } from '../lib/types'

/**
 * Portrait Kinetic — bottom-third layout for portrait video.
 *
 * Canvas split:
 *   Top ~68%: gradient background with side accents + divider line
 *   Bottom 32%: caption zone, words spin in with elastic spring
 *
 * Good for: short-form hooks, punchy statements, social clips
 */
export const portraitKinetic: Template = {
  id: 'portrait-kinetic',
  name: 'Portrait Kinetic (Bottom Third)',
  brandDefaults: {
    background: '#0a0a14',
    textColor: '#ffffff',
    highlightColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.12,
    designOverlays: [],
  },
  background: {
    type: 'gradient',
    gradient: { from: '#0c0c1e', to: '#050508', angle: 170 },
  },
  captionBox: {
    x: 'center',
    y: 1310,          // Bottom 31% of 1920px canvas
    width: 1020,
    height: 280,
    padding: 24,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 96,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 1.05,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    backgroundColor: '#3b82f6',
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
  wordEntry: 'spin-in',
  zones: {
    topBar: {
      height: 6,
      color: '#3b82f6',
      opacity: 1,
    },
    dividerLine: {
      color: '#3b82f6',
      opacity: 0.45,
      yPosition: 1270,
      widthPercent: 88,
    },
    sideAccents: {
      width: 4,
      color: '#3b82f6',
      opacity: 0.25,
      heightPercent: 55,
    },
  },
}
