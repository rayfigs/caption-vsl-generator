import type { CaptionSegment, Template } from '../lib/types'

interface CaptionBlockProps {
  segment: CaptionSegment
  activeWordIndex: number
  template: Template
}

export const CaptionBlock: React.FC<CaptionBlockProps> = ({ segment, activeWordIndex, template }) => {
  const words = segment.words.length > 0 ? segment.words : segment.text.split(/\s+/).map((word) => ({ word, start: 0, end: 0 }))

  return (
    <div
      style={{
        position: 'absolute',
        left: template.captionBox.x === 'center' ? '50%' : template.captionBox.x,
        top: template.captionBox.y === 'center' ? '50%' : template.captionBox.y,
        width: template.captionBox.width,
        minHeight: template.captionBox.height,
        transform:
          template.captionBox.x === 'center' || template.captionBox.y === 'center'
            ? `translate(${template.captionBox.x === 'center' ? '-50%' : '0'}, ${template.captionBox.y === 'center' ? '-50%' : '0'})`
            : undefined,
        padding: template.captionBox.padding,
        color: template.text.color,
        fontFamily: template.text.fontFamily,
        fontSize: template.text.fontSize,
        fontWeight: template.text.fontWeight as never,
        lineHeight: template.text.lineHeight,
        textAlign: template.text.textAlign,
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${segment.startTime}-${index}-${word.word}`}
          style={{
            color:
              template.highlight.enabled && index === activeWordIndex
                ? template.highlight.color || template.text.color
                : template.text.color,
            marginRight: 8,
          }}
        >
          {word.word}
        </span>
      ))}
    </div>
  )
}
