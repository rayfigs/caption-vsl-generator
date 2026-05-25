import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { CaptionBlock } from '../components/CaptionBlock'
import { DesignOverlays } from '../components/DesignOverlays'
import { LogoOverlay } from '../components/LogoOverlay'
import { PortraitZones } from '../components/PortraitZones'
import { Sparkles } from '../components/Sparkles'
import { applyBrandingToTemplate } from '../lib/branding'
import type { BackgroundSlide, BrandedTemplateProps, CaptionSegment, Template } from '../lib/types'
import { findActiveWordIndex } from '../lib/transcript-parser'

export interface CaptionVSLProps {
  template: Template
  brand?: BrandedTemplateProps
  segments: CaptionSegment[]
  audioUrl: string
  audioDuration: number
  backgroundSlides?: BackgroundSlide[]
}

export function getActiveSegment(
  segments: CaptionSegment[],
  currentTime: number
): CaptionSegment | null {
  return segments.find((segment) => currentTime >= segment.startTime && currentTime < segment.endTime) || null
}

export const CaptionVSL: React.FC<CaptionVSLProps> = ({ template, brand, segments, audioUrl, audioDuration, backgroundSlides }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps
  const resolved = applyBrandingToTemplate(template, brand)
  const activeSegment = getActiveSegment(segments, currentTime)
  const activeWordIndex = activeSegment ? findActiveWordIndex(activeSegment, currentTime) : -1

  // Find active background slide (if any)
  const activeSlide = backgroundSlides?.find(
    (slide) => currentTime >= slide.startTime && currentTime < slide.endTime
  )

  return (
    <AbsoluteFill>
      <Background config={resolved.template.background} />

      {/* Background slide layer: covers the solid bg when active */}
      {activeSlide && (
        <AbsoluteFill>
          <Img
            src={activeSlide.imageUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Darken overlay for caption readability */}
          <AbsoluteFill style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }} />
        </AbsoluteFill>
      )}

      {audioUrl ? <Audio src={audioUrl} /> : null}

      {/* Portrait decorative zones (top bar, divider, side accents, frame lines) */}
      {resolved.template.zones && (
        <PortraitZones
          zones={resolved.template.zones}
          canvasWidth={resolved.template.canvas.width}
          canvasHeight={resolved.template.canvas.height}
        />
      )}

      {activeSegment ? (
        <CaptionBlock
          segment={activeSegment}
          activeWordIndex={activeWordIndex}
          template={resolved.template}
          transition={resolved.template.transitions}
          currentTime={currentTime}
        />
      ) : null}
      {/* Floating sparkle particles */}
      <Sparkles color={resolved.brand.highlightColor || resolved.template.highlight.backgroundColor || '#D0A169'} count={22} />

      <DesignOverlays brand={resolved.brand} template={resolved.template} />
      <LogoOverlay brand={resolved.brand} template={resolved.template} audioDuration={audioDuration} />

      {/* Text watermark */}
      {resolved.brand.watermarkText ? (
        <div
          style={{
            position: 'absolute',
            right: 32,
            bottom: 28,
            fontFamily: resolved.template.text.fontFamily,
            fontSize: 22,
            fontWeight: '400',
            color: resolved.brand.watermarkColor || resolved.brand.highlightColor || '#D0A169',
            opacity: resolved.brand.watermarkOpacity ?? 0.6,
            letterSpacing: 0.5,
          }}
        >
          {resolved.brand.watermarkText}
        </div>
      ) : null}
    </AbsoluteFill>
  )
}
