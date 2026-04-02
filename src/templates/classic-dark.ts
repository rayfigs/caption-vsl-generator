import type { Template } from '../lib/types'

export const classicDark: Template = {
  id: 'classic-dark',
  name: 'Classic Dark',
  background: {
    type: 'solid',
    color: '#050505',
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 920,
    height: 520,
    padding: 32,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 52,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.35,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#facc15',
  },
  canvas: {
    width: 1080,
    height: 1080,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.3,
  },
}
