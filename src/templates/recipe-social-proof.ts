import type { Template } from '../lib/types'

export const recipeSocialProof: Template = {
  id: 'recipe-social-proof',
  name: 'Social Proof',
  brandDefaults: {
    background: '#000000',
    textColor: '#ffffff',
    highlightColor: '#ffffff',
    secondaryColor: '#cccccc',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.1,
    designOverlays: [],
  },
  background: {
    type: 'solid',
    color: '#000000',
  },
  captionBox: {
    x: 'center',
    y: 1360,
    width: 1020,
    height: 380,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
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
    type: 'word',
    backgroundColor: 'brand',
    color: '#ffffff',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.5,
  },
  animationStyle: 'smooth',
  wordEntry: 'spotlight',
}
