import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { SPRING_PRESETS } from '../lib/types'
import type { AnimationStyle, CaptionSegment, Template, WordEntryStyle } from '../lib/types'

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

interface WordAnimResult {
  opacity: number
  translateY: number
  scale: number
  rotate: number        // degrees
  blur?: number         // px, used by blur-in
  clipProgress?: number // 0→1, used by typewriter (clip-path reveal)
}

/**
 * Dedicated spring config for rotation animations.
 * overshootClamping: true prevents the spring from oscillating past its target.
 * Without this, underdamped presets cause visible rotation jiggle after settling.
 */
const ROTATION_SPRING = {
  damping: 36,
  stiffness: 520,
  mass: 0.55,
  overshootClamping: true,
}

function computeWordAnim(
  wordFrame: number,
  fps: number,
  preset: { damping: number; stiffness: number; mass: number },
  wordEntry: WordEntryStyle,
  wordIndex: number
): WordAnimResult {
  if (wordEntry === 'none' || wordEntry === 'spotlight') {
    return { opacity: 1, translateY: 0, scale: 1, rotate: 0 }
  }

  // Position/scale spring uses the template's named preset for kinetic feel
  const s = spring({ frame: wordFrame, fps, config: preset })

  switch (wordEntry) {
    case 'stagger': {
      const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const translateY = interpolate(s, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY, scale: 1, rotate: 0 }
    }
    case 'pop': {
      const scale = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const opacity = interpolate(s, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY: 0, scale, rotate: 0 }
    }
    case 'cascade': {
      const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const translateY = interpolate(s, [0, 1], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY, scale: 1, rotate: 0 }
    }
    case 'spin-in': {
      // Rotation uses a separate clamped spring — no overshoot, no jiggle.
      // Y position uses the template preset for kinetic feel.
      const rotSpring = spring({ frame: wordFrame, fps, config: ROTATION_SPRING })
      const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const rotate = interpolate(rotSpring, [0, 1], [-18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const translateY = interpolate(s, [0, 1], [28, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY, scale: 1, rotate }
    }
    case 'tumble': {
      // Both rotation and scale use clamped springs — scale overshoot at 0.6→1
      // is just as visible as rotation jiggle, so we clamp both.
      const dir = wordIndex % 2 === 0 ? 1 : -1
      const rotSpring = spring({ frame: wordFrame, fps, config: ROTATION_SPRING })
      const scaleSpring = spring({ frame: wordFrame, fps, config: ROTATION_SPRING })
      const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const rotate = interpolate(rotSpring, [0, 1], [dir * 14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const scale = interpolate(scaleSpring, [0, 1], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY: 0, scale, rotate }
    }
    case 'typewriter': {
      // Clip-path reveals the word from left to right — like a cursor typing it in.
      // Uses a fast clamped spring so the reveal feels snappy, not bouncy.
      const revealSpring = spring({ frame: wordFrame, fps, config: ROTATION_SPRING })
      const clipProgress = interpolate(revealSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity: 1, translateY: 0, scale: 1, rotate: 0, clipProgress }
    }
    case 'wave': {
      // Y position follows a wave arc: comes from below, overshoots slightly upward,
      // then settles at 0. Each word offsets the peak by its index.
      const waveSpring = spring({ frame: wordFrame, fps, config: { damping: 14, stiffness: 300, mass: 0.7 } })
      const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const translateY = interpolate(waveSpring, [0, 1], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY, scale: 1, rotate: 0 }
    }
    case 'blur-in': {
      // Word fades in while sharpening: blur(8px) → blur(0). Reads as focus pull.
      const blurProgress = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const opacity = interpolate(s, [0, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const blur = interpolate(blurProgress, [0, 1], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity, translateY: 0, scale: 1, rotate: 0, blur }
    }
    default:
      return { opacity: 1, translateY: 0, scale: 1, rotate: 0 }
  }
}

export const CaptionBlock: React.FC<CaptionBlockProps> = ({
  segment,
  activeWordIndex,
  template,
  transition,
  currentTime,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const animationStyle: AnimationStyle = template.animationStyle ?? 'snappy'
  const wordEntry: WordEntryStyle = template.wordEntry ?? 'stagger'
  const preset = SPRING_PRESETS[animationStyle]

  // rotation-heavy and wave styles use 3-frame stagger so the motion reads per word
  const staggerFrames = (
    wordEntry === 'cascade' ||
    wordEntry === 'spin-in' ||
    wordEntry === 'tumble' ||
    wordEntry === 'wave'
  ) ? 3 : 2

  const rawWords = segment.text.split(/\s+/)
  const words = rawWords.filter((w) => !/^[=\-*#>]+$/.test(w))

  const transitionStyle = getTransitionStyle(currentTime, segment, transition, template)
  const hasHighlightBg = template.highlight.enabled && template.highlight.backgroundColor

  const segmentStartFrame = Math.round(segment.startTime * fps)

  const activeWord = activeWordIndex >= 0 ? segment.words[activeWordIndex] : null
  const activeWordStartFrame = activeWord ? Math.round(activeWord.start * fps) : 0

  const highlightSpring = activeWord
    ? spring({ frame: frame - activeWordStartFrame, fps, config: preset })
    : 0

  const highlightScale = interpolate(highlightSpring, [0, 1], [0.85, 1])

  return (
    <div
      style={{
        position: 'absolute',
        left: template.captionBox.x === 'center' ? '50%' : template.captionBox.x,
        top: template.captionBox.y === 'center' ? '50%' : template.captionBox.y,
        width: template.captionBox.width,
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
        whiteSpace: 'nowrap',
        ...transitionStyle,
      }}
    >
      <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: template.text.fontSize * 0.35,
            position: 'relative',
          }}
        >
          {words.map((word, wordIndex) => {
            const isActive = wordIndex === activeWordIndex

            const wordFrame = frame - segmentStartFrame - wordIndex * staggerFrames
            const { opacity, translateY, scale, rotate, blur, clipProgress } = computeWordAnim(
              wordFrame, fps, preset, wordEntry, wordIndex
            )

            const spotlightOpacity = wordEntry === 'spotlight' ? (isActive ? 1 : 0.3) : 1
            const finalOpacity = opacity * spotlightOpacity

            // typewriter: clip-path reveals from left. 100% right = fully hidden, 0% = fully shown.
            const clipPath = clipProgress !== undefined
              ? `inset(0 ${Math.round((1 - clipProgress) * 100)}% 0 0)`
              : undefined

            // blur-in: CSS filter blur, only applied when blur value is present
            const filter = blur !== undefined && blur > 0 ? `blur(${blur.toFixed(1)}px)` : undefined

            // Determine text color: when highlighted, ensure contrast against the highlight box.
            // Default to white (#ffffff) on any colored highlight background.
            const highlightTextColor = hasHighlightBg && isActive
              ? '#ffffff'
              : template.text.color

            return (
              <span
                key={`${segment.startTime}-${wordIndex}-${word}`}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  opacity: finalOpacity,
                  transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                  transformOrigin: 'bottom center',
                  ...(clipPath ? { clipPath, overflow: 'hidden' } : {}),
                  ...(filter ? { filter } : {}),
                }}
              >
                {/* Highlight box: beveled gradient with bottom shadow */}
                {hasHighlightBg && isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-10px',
                      right: '-10px',
                      bottom: '-6px',
                      background: `linear-gradient(180deg, ${template.highlight.backgroundColor} 0%, ${template.highlight.backgroundColor} 60%, ${template.highlight.backgroundColor}cc 100%)`,
                      borderRadius: 8,
                      zIndex: 0,
                      transform: `scale(${highlightScale})`,
                      transformOrigin: 'center center',
                      boxShadow: `0 6px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                      borderTop: '1px solid rgba(255,255,255,0.3)',
                      borderBottom: '1px solid rgba(0,0,0,0.25)',
                    }}
                  />
                )}
                {/* Text: always renders above the highlight box */}
                <span style={{ position: 'relative', zIndex: 1, color: highlightTextColor }}>
                  {word}
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
