import type { Template } from '../lib/types'

export const notificationCard: Template = {
  id: 'notification-card',
  name: 'Notification Card',
  brandDefaults: {
    background: '#111827',
    textColor: '#111827',
    highlightColor: '#7c3aed',
    secondaryColor: '#312e81',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'bottom-right',
    logoScale: 0.14,
    logoPlacement: 'corner-badge',
    designOverlays: [],
    ctaText: 'See It In Action',
    tagline: 'Trusted by modern teams',
  },
  background: {
    type: 'gradient',
    gradient: {
      from: '#111827',
      to: '#312e81',
      angle: 135,
    },
  },
  captionBox: {
    x: 'center',
    y: 'center',
    width: 760,
    height: 420,
    padding: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 36,
    shadow: true,
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 42,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.35,
    textAlign: 'center',
  },
  highlight: {
    enabled: true,
    type: 'word',
    color: '#7c3aed',
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
