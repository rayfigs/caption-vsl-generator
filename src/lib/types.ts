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

export interface LayoutConfig {
  boxWidth: number
  boxHeight: number
  fontSize: number
  lineHeight: number
  fontFamily: string
  padding: number
}

export interface Template {
  id: string
  name: string
  background: {
    type: 'solid' | 'gradient' | 'image' | 'video'
    color?: string
    gradient?: { from: string; to: string; angle: number }
    imageUrl?: string
    videoUrl?: string
    blur?: number
    darken?: number
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
}

export interface TTSResult {
  audioUrl: string
  duration: number
  wordTimestamps: WordTimestamp[]
}

export interface RenderCaptionVSLOptions {
  transcript: string
  templateId: string
  voiceId: string
  outputPath: string
  canvas: { width: number; height: number }
  overrides?: Partial<Template>
}
