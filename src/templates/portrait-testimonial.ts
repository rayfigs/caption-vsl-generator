import type { Template } from '../lib/types'

/**
 * Portrait Testimonial — caption overlay on original video footage.
 *
 * Designed for the Whisper + inputVideo workflow where real client footage
 * becomes the background. The caption box sits in the bottom third with a
 * semi-transparent scrim for readability.
 *
 * Background type is intentionally set to solid here as a fallback —
 * render.ts overrides it to 'video' when inputVideo is provided.
 *
 * Good for: client testimonials, social proof clips, real-person UGC
 */
export const portraitTestimonial: Template = {
  id: 'portrait-testimonial',
  name: 'Portrait Testimonial (Video Overlay)',
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
    // render.ts replaces this with type:'video' when --input-video is used.
    type: 'solid',
    color: '#000000',
  },
  captionBox: {
    x: 'center',
    y: 1360,
    width: 1020,
    height: 380,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
    // backgroundColor gets overridden by brand.highlightColor (e.g. #9003F1 purple).
    // color is the text shown ON TOP of the highlight box — white reads on purple.
    backgroundColor: '#9003F1',
    color: '#ffffff',
  },
  canvas: {
    width: 1080,
    height: 1920,
  },
  transitions: {
    segmentIn: 'fade',
    segmentOut: 'fade',
    duration: 0.15,
  },
  animationStyle: 'snappy',
  wordEntry: 'stagger',
}
