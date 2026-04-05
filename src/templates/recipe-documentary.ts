import type { Template } from '../lib/types'

export const recipeDocumentary: Template = {
  id: 'recipe-documentary',
  name: 'Documentary',
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
    darken: 0.1,
  },
  captionBox: {
    x: 'center',
    y: 1500,
    width: 1020,
    height: 380,
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 52,
    fontWeight: '400',
    color: '#ffffff',
    lineHeight: 1.3,
    textAlign: 'left',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
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
    duration: 0.8,
  },
  animationStyle: 'smooth',
  wordEntry: 'none',
}
