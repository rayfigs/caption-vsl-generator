import { fitTextToBox } from '../lib/layout-engine'
import type { CaptionSegment, Template } from '../lib/types'

interface CaptionBlockProps {
  segment: CaptionSegment
  activeWordIndex: number
  template: Template
  transition: Template['transitions']
  currentTime: number
}

function getTransitionStyle(
  currentTime: number,
  segment: CaptionSegment,
  transition: Template['transitions'],
  template: Template
) {
  const elapsed = Math.max(currentTime - segment.startTime, 0)
  const remaining = Math.max(segment.endTime - currentTime, 0)
  const duration = Math.max(transition.duration, 0.001)
  const introProgress = Math.min(elapsed / duration, 1)
  const outroProgress = Math.min(remaining / duration, 1)

  let opacity = 1
  let translateY = 0

  if (transition.segmentIn === 'fade') {
    opacity = introProgress
  }

  if (transition.segmentIn === 'slide-up') {
    opacity = introProgress
    translateY = (1 - introProgress) * 18
  }

  if (transition.segmentOut === 'fade' && remaining < duration) {
    opacity = Math.min(opacity, outroProgress)
  }

  return {
    opacity,
    transform: `translate(${template.captionBox.x === 'center' ? '-50%' : '0'}, ${
      template.captionBox.y === 'center' ? `calc(${translateY}px - 50%)` : `${translateY}px`
    })`,
  }
}

export const CaptionBlock: React.FC<CaptionBlockProps> = ({
  segment,
  activeWordIndex,
  template,
  transition,
  currentTime,
}) => {
  const lines = fitTextToBox(segment.text, {
    boxWidth: template.captionBox.width,
    boxHeight: template.captionBox.height,
    fontSize: template.text.fontSize,
    lineHeight: template.text.lineHeight,
    fontFamily: template.text.fontFamily,
    padding: template.captionBox.padding,
  })
  const transitionStyle = getTransitionStyle(currentTime, segment, transition, template)
  let wordCursor = 0

  return (
    <div
      style={{
        position: 'absolute',
        left: template.captionBox.x === 'center' ? '50%' : template.captionBox.x,
        top: template.captionBox.y === 'center' ? '50%' : template.captionBox.y,
        width: template.captionBox.width,
        minHeight: template.captionBox.height,
        padding: template.captionBox.padding,
        color: template.text.color,
        fontFamily: template.text.fontFamily,
        fontSize: template.text.fontSize,
        fontWeight: template.text.fontWeight as never,
        lineHeight: template.text.lineHeight,
        textAlign: template.text.textAlign,
        backgroundColor: template.captionBox.backgroundColor,
        borderRadius: template.captionBox.borderRadius,
        boxShadow: template.captionBox.shadow ? '0 12px 40px rgba(0,0,0,0.18)' : undefined,
        ...transitionStyle,
      }}
    >
      {lines.map((line, lineIndex) => {
        const lineWords = line.split(/\s+/)
        const offset = wordCursor
        wordCursor += lineWords.length

        return (
          <div key={`${segment.startTime}-line-${lineIndex}`} style={{ marginBottom: 10 }}>
            {lineWords.map((lineWord, wordIndex) => {
              const absoluteIndex = offset + wordIndex
              const isActive = absoluteIndex === activeWordIndex
              const underline =
                template.highlight.enabled && isActive && template.highlight.underline
                  ? 'underline'
                  : undefined

              return (
                <span
                  key={`${segment.startTime}-${lineIndex}-${wordIndex}-${lineWord}`}
                  data-active={isActive ? 'true' : 'false'}
                  style={{
                    color:
                      template.highlight.enabled && isActive
                        ? template.highlight.color || template.text.color
                        : template.text.color,
                    marginRight: 8,
                    textDecoration: underline,
                  }}
                >
                  {lineWord}
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
