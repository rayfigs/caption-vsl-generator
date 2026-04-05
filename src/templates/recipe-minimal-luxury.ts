import type { Template } from '../lib/types'

export const recipeMinimalLuxury: Template = {
  id: 'recipe-minimal-luxury',
  name: 'Minimal Luxury',
  brandDefaults: {
    background: '#000000',
    textColor: '#F5F0EB',
    highlightColor: '#F5F0EB',
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
    darken: 0.15,
  },
  captionBox: {
    x: 'center',
    y: 1100,
    width: 1020,
    height: 380,
    padding: 40,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 48,
    fontWeight: '300',
    color: '#F5F0EB',
    lineHeight: 1.4,
    textAlign: 'center',
    letterSpacing: 4,
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
    duration: 1.2,
  },
  animationStyle: 'smooth',
  wordEntry: 'blur-in',
}
