import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { CaptionBlock } from '../components/CaptionBlock'
import type { CaptionSegment, Template } from '../lib/types'
import { findActiveWordIndex } from '../lib/transcript-parser'

export interface CaptionVSLProps {
  template: Template
  segments: CaptionSegment[]
  audioUrl: string
  audioDuration: number
}

export function getActiveSegment(
  segments: CaptionSegment[],
  currentTime: number
): CaptionSegment | null {
  return segments.find((segment) => currentTime >= segment.startTime && currentTime < segment.endTime) || null
}

export const CaptionVSL: React.FC<CaptionVSLProps> = ({ template, segments, audioUrl }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps
  const activeSegment = getActiveSegment(segments, currentTime)
  const activeWordIndex = activeSegment ? findActiveWordIndex(activeSegment, currentTime) : -1

  return (
    <AbsoluteFill>
      <Background config={template.background} />
      {audioUrl ? <Audio src={audioUrl} /> : null}
      {activeSegment ? (
        <CaptionBlock
          segment={activeSegment}
          activeWordIndex={activeWordIndex}
          template={template}
          transition={template.transitions}
          currentTime={currentTime}
        />
      ) : null}
    </AbsoluteFill>
  )
}
