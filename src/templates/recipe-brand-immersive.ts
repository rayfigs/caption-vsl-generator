import type { Template } from '../lib/types'

export const recipeBrandImmersive: Template = {
  id: 'recipe-brand-immersive',
  name: 'Brand Immersive',
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
    type: 'gradient',
    color: '#000000',
  },
  captionBox: {
    x: 'center',
    y: 1360,
    width: 1020,
    height: 380,
    padding: 20,
    backgroundColor: 'brand',
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
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'slide-up',
    segmentOut: 'fade',
    duration: 0.15,
  },
  animationStyle: 'smooth',
  wordEntry: 'stagger',
}
