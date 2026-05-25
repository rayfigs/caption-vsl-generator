export interface WordTimestamp {
  word: string
  start: number
  end: number
}

export interface CaptionSegment {
  text: string
  words: WordTimestamp[]
  startTime: number
  endTime: number
  activeWordIndex?: number
}

export interface BackgroundSlide {
  imageUrl: string
  startTime: number
  endTime: number
}

export interface LayoutConfig {
  boxWidth: number
  boxHeight: number
  fontSize: number
  lineHeight: number
  fontFamily: string
  padding: number
}

export type LogoCornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type LogoPlacement = 'corner-badge' | 'intro-card' | 'outro-card' | 'watermark' | 'lower-third'

export type DesignOverlay = 'gradient-scrim' | 'frame-border' | 'cta-bar'

export interface BrandedTemplateProps {
  background?: string
  textColor?: string
  highlightColor?: string
  secondaryColor?: string
  headingFont?: string
  bodyFont?: string
  logoUrl?: string
  logoPosition?: LogoCornerPosition
  logoScale?: number
  logoPlacement?: LogoPlacement
  designOverlays?: DesignOverlay[]
  ctaText?: string
  tagline?: string
  watermarkText?: string
  watermarkColor?: string
  watermarkOpacity?: number
}

export interface Template {
  id: string
  name: string
  brandDefaults: BrandedTemplateProps
  background: {
    type: 'solid' | 'gradient' | 'image' | 'video'
    color?: string
    gradient?: { from: string; to: string; angle: number }
    imageUrl?: string
    videoUrl?: string
    blur?: number
    darken?: number
    /** Radial spotlight glow from center. Color + size (0-1 range, default 0.5) */
    radialGlow?: { color: string; size?: number; opacity?: number }
  }
  captionBox: {
    x: number | 'center'
    y: number | 'center'
    width: number
    height: number
    padding: number
    backgroundColor?: string
    borderRadius?: number
    shadow?: boolean
  }
  text: {
    fontFamily: string
    fontSize: number
    fontWeight: string
    color: string
    lineHeight: number
    textAlign: 'left' | 'center' | 'right'
  }
  highlight: {
    enabled: boolean
    type: 'word' | 'line' | 'none'
    color?: string
    backgroundColor?: string
    underline?: boolean
  }
  canvas: {
    width: number
    height: number
  }
  transitions: {
    segmentIn: 'none' | 'fade' | 'slide-up' | 'typewriter'
    segmentOut: 'none' | 'fade'
    duration: number
  }
  /** Named spring preset for all animations in this template */
  animationStyle?: AnimationStyle
  /** How individual words enter on screen */
  wordEntry?: WordEntryStyle
  /** Decorative layout zones — mainly for portrait compositions */
  zones?: PortraitZoneConfig
}

export interface TTSResult {
  audioUrl: string
  duration: number
  wordTimestamps: WordTimestamp[]
}

/** Canvas presets for common aspect ratios */
export type CanvasPreset = 'landscape' | 'portrait' | 'square'

export const CANVAS_PRESETS: Record<CanvasPreset, { width: number; height: number }> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
}

/** Brand kit for applying client-specific styling */
export interface BrandKit {
  name: string
  primaryColor: string       // Main brand color (used for highlight bg)
  secondaryColor: string     // Accent color (used for gradient endpoint)
  textColor: string          // Text color override
  backgroundColor: string    // Background color override
  fontFamily: string         // Font override (must be available in Remotion)
  fontWeight: string         // e.g. '800'
  logoUrl?: string           // Logo image URL
  logoPosition?: LogoCornerPosition
  logoScale?: number
  gradient?: {               // Optional subtle gradient using brand colors
    enabled: boolean
    from: string             // Start color (usually primaryColor with low opacity)
    to: string               // End color (usually secondaryColor with low opacity)
    angle: number            // Degrees (180 = top to bottom)
  }
}

export type Transcriber = 'elevenlabs' | 'whisper'

/**
 * ElevenLabs voice settings. Lower stability = more expressive delivery with
 * natural variation and emphasis; too low can introduce artifacts on a clone.
 * style adds delivery flair; similarityBoost keeps it sounding like the speaker.
 */
export interface VoiceSettings {
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
  speed?: number
}

export interface RenderCaptionVSLOptions {
  transcript: string
  templateId: string
  voiceId: string
  outputPath: string
  /** ElevenLabs delivery controls (variation, emphasis, pacing). */
  voiceSettings?: VoiceSettings
  canvas?: { width: number; height: number } | CanvasPreset
  brand?: BrandedTemplateProps
  /** Named brand profile from src/brands/index.ts — resolved to BrandedTemplateProps at render time */
  brandName?: string
  brandKit?: BrandKit
  overrides?: Partial<Template>
  /**
   * Path to a video or audio file to transcribe.
   * When provided with transcriber: 'whisper', the file's audio is sent to
   * OpenAI Whisper instead of generating TTS via ElevenLabs.
   * Captions are overlaid on the original footage.
   */
  inputVideo?: string
  /** Which transcription engine to use. Default: 'elevenlabs' */
  transcriber?: Transcriber
  /**
   * Automatically reframe landscape footage to portrait (9:16) before captioning.
   * Only applies when inputVideo is also set.
   * Reframed file is written next to the output path.
   */
  autoReframe?: boolean
  /**
   * Darken multiplier applied to the video background (0 = none, 1 = black).
   * Default: 0.35. Makes captions readable without blocking the subject.
   */
  videoDarken?: number
  /** Background slides: images that appear behind captions during specific time ranges */
  backgroundSlides?: Array<{ imagePath: string; startTime: number; endTime: number }>
}

/**
 * Named spring animation presets.
 * snappy = fast snap (AE: ease out), bouncy = elastic entry (AE: elastic ease),
 * smooth = gentle (AE: ease in-out), elastic = strong overshoot, none = instant.
 */
export type AnimationStyle = 'snappy' | 'bouncy' | 'smooth' | 'elastic' | 'none'

export interface SpringConfig {
  damping: number
  stiffness: number
  mass: number
}

export const SPRING_PRESETS: Record<AnimationStyle, SpringConfig> = {
  snappy:  { damping: 28, stiffness: 600, mass: 0.5 },
  bouncy:  { damping: 12, stiffness: 280, mass: 0.8 },
  smooth:  { damping: 40, stiffness: 200, mass: 1.0 },
  elastic: { damping: 8,  stiffness: 150, mass: 1.2 },
  none:    { damping: 100, stiffness: 1000, mass: 0.1 },
}

/**
 * Word entry animation styles — how each word appears on screen.
 * stagger: slide-up + fade with per-word delay (AE: Text Animator stagger)
 * pop: scale from 0→1 with spring (AE: scale keyframe)
 * cascade: drop from above one by one
 * spotlight: active word full brightness, others dimmed
 * none: instant appearance (current default)
 * typewriter: each word clips in left-to-right (horizontal reveal)
 * wave: words bounce in a wave arc as they appear
 * blur-in: words fade in from blurry to sharp
 */
export type WordEntryStyle =
  | 'none'       // instant
  | 'stagger'    // slide up + fade, per-word delay
  | 'pop'        // scale 0→1 with spring
  | 'cascade'    // drop from above
  | 'spotlight'  // dim non-active words
  | 'spin-in'    // rotate Z + slide up (AE: rotation + position keyframe)
  | 'tumble'     // alternating rotation direction per word
  | 'typewriter' // clip-path reveal left-to-right
  | 'wave'       // translateY arc: enters from below, crests, settles
  | 'blur-in'    // opacity fade + blur(8px) → blur(0)

/**
 * Visual decoration zones for portrait layouts.
 * These are rendered as fixed-position design elements over the background,
 * independent of the caption text.
 */
export interface PortraitZoneConfig {
  /** Thin colored bar at the very top of the frame */
  topBar?: {
    height: number
    color: string
    opacity?: number
  }
  /** Horizontal accent line drawn above the caption zone */
  dividerLine?: {
    color: string
    opacity?: number
    yPosition: number   // px from top
    widthPercent?: number  // 0-100, defaults to 100
  }
  /** Thin vertical bars on left and right edges */
  sideAccents?: {
    width: number
    color: string
    opacity?: number
    heightPercent?: number  // 0-100, defaults to 60 (centered vertically)
  }
  /** Horizontal lines framing the caption area above and below */
  frameLines?: {
    color: string
    opacity?: number
    yOffset: number        // px above/below caption center
    widthPercent: number   // 0-100
  }
}
