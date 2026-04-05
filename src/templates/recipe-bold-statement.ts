import type { Template } from '../lib/types'

export const recipeBoldStatement: Template = {
  id: 'recipe-bold-statement',
  name: 'Bold Statement',
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
    darken: 0.4,
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 1020,
    height: 380,
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 90,
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
    segmentIn: 'none',
    segmentOut: 'none',
    duration: 0,
  },
  animationStyle: 'snappy',
  wordEntry: 'pop',
}
