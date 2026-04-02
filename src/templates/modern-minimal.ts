import type { Template } from '../lib/types'

export const modernMinimal: Template = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  background: {
    type: 'solid',
    color: '#f8fafc',
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 860,
    height: 520,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadow: true,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 44,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#2563eb',
    underline: true,
  },
  canvas: {
    width: 1080,
    height: 1080,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.25,
  },
}
