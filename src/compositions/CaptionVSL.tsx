import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { CaptionBlock } from '../components/CaptionBlock'
import { DesignOverlays } from '../components/DesignOverlays'
import { LogoOverlay } from '../components/LogoOverlay'
import { applyBrandingToTemplate } from '../lib/branding'
import type { BrandedTemplateProps, CaptionSegment, Template } from '../lib/types'
import { findActiveWordIndex } from '../lib/transcript-parser'

export interface CaptionVSLProps {
  template: Template
  brand?: BrandedTemplateProps
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

export const CaptionVSL: React.FC<CaptionVSLProps> = ({ template, brand, segments, audioUrl, audioDuration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps
  const resolved = applyBrandingToTemplate(template, brand)
  const activeSegment = getActiveSegment(segments, currentTime)
  const activeWordIndex = activeSegment ? findActiveWordIndex(activeSegment, currentTime) : -1

  return (
    <AbsoluteFill>
      <Background config={resolved.template.background} />
      {audioUrl ? <Audio src={audioUrl} /> : null}
      {activeSegment ? (
        <CaptionBlock
          segment={activeSegment}
          activeWordIndex={activeWordIndex}
          template={resolved.template}
          transition={resolved.template.transitions}
          currentTime={currentTime}
        />
      ) : null}
      <DesignOverlays brand={resolved.brand} template={resolved.template} />
      <LogoOverlay brand={resolved.brand} template={resolved.template} audioDuration={audioDuration} />
    </AbsoluteFill>
  )
}
