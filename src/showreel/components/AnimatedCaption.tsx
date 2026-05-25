import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface AnimatedCaptionProps {
  words: string[]
  highlightWords?: string[]
  highlightColor?: string
  fontSize?: number
  staggerFrames?: number
  startFrame?: number
}

/**
 * Renders words with a staggered spring entry animation.
 * Highlighted words get the brand accent color background.
 */
export const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({
  words,
  highlightWords = [],
  highlightColor = BRAND.purple,
  fontSize = 90,
  staggerFrames = 4,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div style={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: fontSize * 0.3,
      padding: `0 ${fontSize * 0.4}px`,
    }}>
      {words.map((word, i) => {
        const wordFrame = Math.max(0, frame - startFrame - i * staggerFrames)
        const s = spring({
          frame: wordFrame,
          fps,
          config: { damping: 26, stiffness: 400, mass: 0.55 },
        })
        const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
        const translateY = interpolate(s, [0, 1], [28, 0], { extrapolateRight: 'clamp' })
        const isHighlighted = highlightWords.includes(word.replace(/[^a-zA-Z]/g, '').toLowerCase())

        return (
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px)`,
              fontSize,
              fontFamily: BRAND.font,
              fontWeight: '800',
              color: isHighlighted ? '#000' : BRAND.white,
              letterSpacing: '-1px',
            }}
          >
            {isHighlighted && (
              <span style={{
                position: 'absolute',
                inset: '-6px -10px',
                backgroundColor: highlightColor,
                borderRadius: 8,
                zIndex: -1,
              }} />
            )}
            {word}
          </span>
        )
      })}
    </div>
  )
}
